
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ResidentCard } from "@/components/ResidentCard";
import { AddResidentForm } from "@/components/AddResidentForm";
import { ResidentDetailsModal } from "@/components/ResidentDetailsModal";
import { usePermissions } from "@/hooks/usePermissions";
import type { Resident } from "@/types/resident";

const mockResidents: Resident[] = [
  {
    id: '1',
    name: 'Maria Santos',
    phone: '(11) 99999-9999',
    unit: '101',
    building: 'A',
    residentType: 'owner' as const,
    status: 'active'
  },
  {
    id: '2',
    name: 'Carlos Silva',
    phone: '(11) 77777-7777',
    unit: '205',
    building: 'B',
    residentType: 'tenant' as const,
    status: 'active'
  }
];

const Residents = () => {
  const { canManageResidents } = usePermissions();
  const [residents, setResidents] = useState<Resident[]>(mockResidents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResidents = useMemo(() => {
    if (!searchTerm) return residents;
    
    return residents.filter(resident =>
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.unit.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [residents, searchTerm]);

  const handleAddResident = (newResident: Omit<Resident, 'id'>) => {
    const id = Date.now().toString();
    setResidents([{ ...newResident, id }, ...residents]);
  };

  const handleUpdateResident = (id: string, updatedData: Omit<Resident, 'id'>) => {
    const updated = { ...updatedData, id };
    setResidents(residents.map(resident => resident.id === id ? updated : resident));
    setSelectedResident(updated);
  };

  const handleDeleteResident = (id: string) => {
    setResidents(residents.filter(resident => resident.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        onAddPackage={canManageResidents ? () => setShowAddForm(true) : undefined}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        title="Moradores"
        addButtonText="Novo Morador"
      />

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Moradores Cadastrados ({filteredResidents.length})
          </h2>

          {filteredResidents.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-base sm:text-lg mb-2">
                {searchTerm ? 'Nenhum morador encontrado' : 'Nenhum morador cadastrado'}
              </div>
              <p className="text-sm sm:text-base text-gray-500 px-4">
                {searchTerm 
                  ? 'Tente buscar por outro termo'
                  : 'Cadastre o primeiro morador clicando no botão "Novo Morador"'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredResidents.map((resident) => (
                <ResidentCard
                  key={resident.id}
                  resident={resident}
                  onViewDetails={setSelectedResident}
                />
              ))}
            </div>
          )}
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
