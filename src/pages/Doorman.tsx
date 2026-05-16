
import { useState, useMemo } from "react";
import { Shield } from "lucide-react";
import { Header } from "@/components/Header";
import { AddDoormanForm } from "@/components/AddDoormanForm";
import { DoormanDetailsModal } from "@/components/DoormanDetailsModal";
import { PaginatedTable, FilterField } from "@/components/PaginatedTable";
import type { Column } from "@/components/PaginatedTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Doorman } from "@/types/doorman";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const shiftConfig = (shift: Doorman['shift']) => {
  switch (shift) {
    case 'morning':   return { color: 'bg-yellow-100 text-yellow-800', label: 'Manhã' };
    case 'afternoon': return { color: 'bg-orange-100 text-orange-800', label: 'Tarde' };
    case 'night':     return { color: 'bg-blue-100 text-blue-800',     label: 'Noite' };
  }
};

const columns: Column<Doorman>[] = [
  {
    header: 'Nome',
    render: (d) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 rounded">
          <Shield className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <span className="font-medium">{d.name}</span>
      </div>
    ),
  },
  { header: 'CPF',      render: (d) => d.cpf,   cellClassName: 'text-gray-600' },
  { header: 'Telefone', render: (d) => d.phone,  cellClassName: 'text-gray-600' },
  {
    header: 'Turno',
    render: (d) => {
      const shift = shiftConfig(d.shift);
      return <Badge className={shift.color}>{shift.label}</Badge>;
    },
  },
  {
    header: 'Status',
    render: (d) => (
      <Badge className={d.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {d.status === 'active' ? 'Ativo' : 'Inativo'}
      </Badge>
    ),
  },
];

const mockDoormen: Doorman[] = [
  { id: '1', name: 'João Silva',   cpf: '111.222.333-44', phone: '(11) 55555-5555', shift: 'morning', status: 'active' },
  { id: '2', name: 'Pedro Santos', cpf: '555.666.777-88', phone: '(11) 33333-3333', shift: 'night',   status: 'active' },
];

const Doormen = () => {
  const [doormen, setDoormen] = useState<Doorman[]>(mockDoormen);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDoorman, setSelectedDoorman] = useState<Doorman | null>(null);

  const [nameFilter, setNameFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const activeFilterCount = [
    !!nameFilter,
    shiftFilter !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setNameFilter('');
    setShiftFilter('all');
    setStatusFilter('all');
  };

  const filteredDoormen = useMemo(() => {
    let filtered = doormen;

    if (nameFilter) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (shiftFilter !== 'all') {
      filtered = filtered.filter(d => d.shift === shiftFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    return filtered;
  }, [doormen, nameFilter, shiftFilter, statusFilter]);

  const handleAddDoorman = (newDoorman: Omit<Doorman, 'id'>) => {
    setDoormen([{ ...newDoorman, id: Date.now().toString() }, ...doormen]);
  };

  const handleUpdateDoorman = (id: string, updatedData: Omit<Doorman, 'id'>) => {
    setDoormen(doormen.map(d => d.id === id ? { ...updatedData, id } : d));
  };

  const handleDeleteDoorman = (id: string) => {
    setDoormen(doormen.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        onAddPackage={() => setShowAddForm(true)}
        title="Porteiros"
        addButtonText="Novo Porteiro"
      />

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <PaginatedTable
            data={filteredDoormen}
            columns={columns}
            onRowClick={setSelectedDoorman}
            emptyMessage="Nenhum porteiro cadastrado"
            emptyFilterMessage="Nenhum porteiro encontrado"
            toolbar={
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Porteiros Cadastrados ({filteredDoormen.length})
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

                  <FilterField label="Turno">
                    <Select value={shiftFilter} onValueChange={setShiftFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os turnos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os turnos</SelectItem>
                        <SelectItem value="morning">Manhã</SelectItem>
                        <SelectItem value="afternoon">Tarde</SelectItem>
                        <SelectItem value="night">Noite</SelectItem>
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
        <AddDoormanForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddDoorman}
        />
      )}

      {selectedDoorman && (
        <DoormanDetailsModal
          doorman={selectedDoorman}
          isOpen={!!selectedDoorman}
          onClose={() => setSelectedDoorman(null)}
          onUpdate={handleUpdateDoorman}
          onDelete={handleDeleteDoorman}
        />
      )}
    </div>
  );
};

export default Doormen;
