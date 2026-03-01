'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  target_pain_point: string;
  recommended_approach: string;
  recommended_products: string[];
  average_deal_min_czk: number;
  average_deal_max_czk: number;
  closing_time_months_min: number;
  closing_time_months_max: number;
  decision_makers: string[];
  key_arguments: string[];
  created_at: string;
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const response = await fetch('/api/segments');
      const data = await response.json();
      setSegments(data);
    } catch (error) {
      console.error('Chyba při načítání segmentů:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento segment? Ovlivní to všechny prospekty a klienty s tímto segmentem.')) {
      return;
    }

    try {
      const response = await fetch(`/api/segments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadSegments();
      } else {
        alert('Chyba při mazání segmentu');
      }
    } catch (error) {
      console.error('Chyba:', error);
      alert('Chyba při mazání segmentu');
    }
  };

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Načítání segmentů...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segmenty</h1>
          <p className="text-gray-600 mt-1">Správa sales playbook pro jednotlivé segmenty</p>
        </div>
        <button
          onClick={() => {
            setSelectedSegment(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nový segment
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Hledat segment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSegments.map((segment) => (
          <div
            key={segment.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{segment.target_pain_point}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedSegment(segment);
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(segment.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Průměrný deal</div>
                <div className="text-sm font-medium text-gray-900">
                  {segment.average_deal_min_czk?.toLocaleString('cs-CZ')} - {segment.average_deal_max_czk?.toLocaleString('cs-CZ')} Kč
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Doba uzavření</div>
                <div className="text-sm font-medium text-gray-900">
                  {segment.closing_time_months_min}-{segment.closing_time_months_max} měsíců
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Doporučené produkty</div>
              <div className="flex flex-wrap gap-2">
                {segment.recommended_products?.map((product, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {product}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Rozhodovatelé</div>
              <div className="flex flex-wrap gap-2">
                {segment.decision_makers?.map((dm, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {dm}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">Klíčové argumenty</div>
              <ul className="text-sm text-gray-700 space-y-1">
                {segment.key_arguments?.slice(0, 3).map((arg, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{arg}</span>
                  </li>
                ))}
                {segment.key_arguments?.length > 3 && (
                  <li className="text-gray-500 text-xs">+ {segment.key_arguments.length - 3} dalších</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {filteredSegments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'Žádné segmenty nenalezeny' : 'Zatím nejsou žádné segmenty'}
        </div>
      )}

      {showForm && (
        <SegmentForm
          segment={selectedSegment}
          onClose={() => {
            setShowForm(false);
            setSelectedSegment(null);
          }}
          onSave={() => {
            setShowForm(false);
            setSelectedSegment(null);
            loadSegments();
          }}
        />
      )}
    </div>
  );
}

function SegmentForm({
  segment,
  onClose,
  onSave,
}: {
  segment: Segment | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: segment?.name || '',
    target_pain_point: segment?.target_pain_point || '',
    recommended_approach: segment?.recommended_approach || '',
    recommended_products: segment?.recommended_products?.join(', ') || '',
    average_deal_min_czk: segment?.average_deal_min_czk || 0,
    average_deal_max_czk: segment?.average_deal_max_czk || 0,
    closing_time_months_min: segment?.closing_time_months_min || 0,
    closing_time_months_max: segment?.closing_time_months_max || 0,
    decision_makers: segment?.decision_makers?.join(', ') || '',
    key_arguments: segment?.key_arguments?.join('\n') || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        target_pain_point: formData.target_pain_point,
        recommended_approach: formData.recommended_approach,
        recommended_products: formData.recommended_products.split(',').map(p => p.trim()).filter(Boolean),
        average_deal_min_czk: Number(formData.average_deal_min_czk),
        average_deal_max_czk: Number(formData.average_deal_max_czk),
        closing_time_months_min: Number(formData.closing_time_months_min),
        closing_time_months_max: Number(formData.closing_time_months_max),
        decision_makers: formData.decision_makers.split(',').map(d => d.trim()).filter(Boolean),
        key_arguments: formData.key_arguments.split('\n').map(a => a.trim()).filter(Boolean),
      };

      const url = segment ? `/api/segments/${segment.id}` : '/api/segments';
      const method = segment ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.json();
        alert(`Chyba: ${error.error}`);
      }
    } catch (error) {
      console.error('Chyba:', error);
      alert('Chyba při ukládání segmentu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {segment ? 'Upravit segment' : 'Nový segment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Název segmentu *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hlavní bolest (Pain Point)
            </label>
            <textarea
              value={formData.target_pain_point}
              onChange={(e) => setFormData({ ...formData, target_pain_point: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doporučený přístup
            </label>
            <textarea
              value={formData.recommended_approach}
              onChange={(e) => setFormData({ ...formData, recommended_approach: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doporučené produkty (oddělené čárkou)
            </label>
            <input
              type="text"
              value={formData.recommended_products}
              onChange={(e) => setFormData({ ...formData, recommended_products: e.target.value })}
              placeholder="Clean Up, PRO I PLUS, Clean Box"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. deal (Kč)
              </label>
              <input
                type="number"
                value={formData.average_deal_min_czk}
                onChange={(e) => setFormData({ ...formData, average_deal_min_czk: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max. deal (Kč)
              </label>
              <input
                type="number"
                value={formData.average_deal_max_czk}
                onChange={(e) => setFormData({ ...formData, average_deal_max_czk: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. doba uzavření (měsíce)
              </label>
              <input
                type="number"
                value={formData.closing_time_months_min}
                onChange={(e) => setFormData({ ...formData, closing_time_months_min: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max. doba uzavření (měsíce)
              </label>
              <input
                type="number"
                value={formData.closing_time_months_max}
                onChange={(e) => setFormData({ ...formData, closing_time_months_max: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rozhodovatelé (oddělené čárkou)
            </label>
            <input
              type="text"
              value={formData.decision_makers}
              onChange={(e) => setFormData({ ...formData, decision_makers: e.target.value })}
              placeholder="Ředitel, Provozní manažer, CFO"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klíčové argumenty (každý na nový řádek)
            </label>
            <textarea
              value={formData.key_arguments}
              onChange={(e) => setFormData({ ...formData, key_arguments: e.target.value })}
              rows={6}
              placeholder="ROI přes produktivitu&#10;Snížení sick days&#10;ESG reporting"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Ukládám...' : segment ? 'Uložit změny' : 'Vytvořit segment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
