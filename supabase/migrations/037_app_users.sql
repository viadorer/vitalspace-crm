-- ============================================================================
-- APP USERS – Správa uživatelů s rolemi a oprávněními
-- ============================================================================

CREATE TYPE app_role AS ENUM (
    'superadmin',
    'admin',
    'consultant',
    'technician',
    'viewer'
);

CREATE TABLE app_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'consultant',
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    phone TEXT,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_app_users_role ON app_users(role);
CREATE INDEX idx_app_users_active ON app_users(is_active);

-- RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Všichni přihlášení vidí uživatele (pro sidebar, přiřazení atd.)
CREATE POLICY "app_users_select" ON app_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Pouze superadmin může upravovat
CREATE POLICY "app_users_insert" ON app_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "app_users_update" ON app_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "app_users_delete" ON app_users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- Trigger pro automatické nastavení updated_at
CREATE OR REPLACE FUNCTION fn_app_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION fn_app_users_updated_at();

-- Trigger pro automatické vytvoření app_users záznamu při registraci
CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.app_users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'consultant'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- Trigger pro aktualizaci last_login_at
CREATE OR REPLACE FUNCTION fn_handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
        UPDATE public.app_users
        SET last_login_at = NEW.last_sign_in_at
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_login
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION fn_handle_user_login();
