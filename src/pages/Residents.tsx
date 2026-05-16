
import { useState, useMemo } from "react";
import { User } from "lucide-react";
import { Header } from "@/components/Header";
import { AddResidentForm } from "@/components/AddResidentForm";
import { ResidentDetailsModal } from "@/components/ResidentDetailsModal";
import { PaginatedTable, FilterField } from "@/components/PaginatedTable";
import type { Column } from "@/components/PaginatedTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/usePermissions";
import type { Resident } from "@/types/resident";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const residentTypeLabel = (r: Resident) => {
  if (r.residentType === 'owner') return 'Proprietário';
  if (r.residentType === 'tenant') return 'Inquilino';
  return 'Outro';
};

const columns: Column<Resident>[] = [
  {
    header: 'Nome',
    render: (r) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 rounded">
          <User className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <span className="font-medium">{r.name}</span>
      </div>
    ),
  },
  { header: 'Unidade', render: (r) => r.unit, cellClassName: 'text-gray-600' },
  { header: 'Bloco', render: (r) => r.building || '—', cellClassName: 'text-gray-600' },
  { header: 'Telefone', render: (r) => r.phone, cellClassName: 'text-gray-600' },
  { header: 'Tipo de Morador', render: residentTypeLabel, cellClassName: 'text-gray-600' },
  {
    header: 'Status',
    render: (r) => (
      <Badge className={r.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {r.status === 'active' ? 'Ativo' : 'Inativo'}
      </Badge>
    ),
  },
];

const mockResidents: Resident[] = [
  { id: '1',  name: 'Maria Santos', phone: '(11) 99999-9999', unit: '101', building: 'A', residentType: 'owner',  status: 'active' },
  { id: '2',  name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '3',  name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '4',  name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '5',  name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '6',  name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '7',  name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '8',  name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '9',  name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '10', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '11', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '12', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '13', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '14', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '15', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '16', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '17', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '18', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '19', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '20', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '21', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
  { id: '22', name: 'Carlos Silva', phone: '(11) 77777-7777', unit: '205', building: 'B', residentType: 'tenant', status: 'active' },
];

const Residents = () => {
  const { canManageResidents } = usePermissions();
  const [residents, setResidents] = useState<Resident[]>(mockResidents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const buildingOptions = useMemo(() =>
    [...new Set(residents.map(r => r.building).filter(Boolean))].sort() as string[],
  [residents]);

  const activeFilterCount = [
    !!nameFilter,
    typeFilter !== 'all',
    buildingFilter !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setNameFilter('');
    setTypeFilter('all');
    setBuildingFilter('all');
    setStatusFilter('all');
  };

  const filteredResidents = useMemo(() => {
    let filtered = residents;

    if (nameFilter) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.residentType === typeFilter);
    }

    if (buildingFilter !== 'all') {
      filtered = filtered.filter(r => r.building === buildingFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    return filtered;
  }, [residents, nameFilter, typeFilter, buildingFilter, statusFilter]);

  const handleAddResident = (newResident: Omit<Resident, 'id'>) => {
    setResidents([{ ...newResident, id: Date.now().toString() }, ...residents]);
  };

  const handleUpdateResident = (id: string, updatedData: Omit<Resident, 'id'>) => {
    const updated = { ...updatedData, id };
    setResidents(residents.map(r => r.id === id ? updated : r));
    setSelectedResident(updated);
  };

  const handleDeleteResident = (id: string) => {
    setResidents(residents.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        onAddPackage={canManageResidents ? () => setShowAddForm(true) : undefined}
        title="Moradores"
        addButtonText="Novo Morador"
      />

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <PaginatedTable
            data={filteredResidents}
            columns={columns}
            onRowClick={setSelectedResident}
            emptyMessage="Nenhum morador cadastrado"
            emptyFilterMessage="Nenhum morador encontrado"
            toolbar={
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Moradores ({filteredResidents.length})
              </h2>
            }
            filters={{
              activeCount: activeFilterCount,
              onClear: handleClearFilters,
              children: (
                <>
                  <FilterField label="Nome">
                    <Input
                      placeholder="Buscar por nome"
                      value={nameFilter}
                      onChange={e => setNameFilter(e.target.value)}
                    />
                  </FilterField>

                  <FilterField label="Tipo de morador">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="owner">Proprietário</SelectItem>
                        <SelectItem value="tenant">Inquilino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FilterField>

                  <FilterField label="Bloco">
                    <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os blocos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os blocos</SelectItem>
                        {buildingOptions.map(b => (
                          <SelectItem key={b} value={b}>Bloco {b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterField>

                  <FilterField label="Status">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FilterField>
                </>
              ),
            }}
          />
        </div>
      </main>

      {showAddForm && (
        <AddResidentForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddResident}
        />
      )}

      {selectedResident && (
        <ResidentDetailsModal
          resident={selectedResident}
          isOpen={!!selectedResident}
          onClose={() => setSelectedResident(null)}
          onUpdate={handleUpdateResident}
          onDelete={handleDeleteResident}
          canEdit={canManageResidents}
          canDelete={canManageResidents}
        />
      )}
    </div>
  );
};

export default Residents;
