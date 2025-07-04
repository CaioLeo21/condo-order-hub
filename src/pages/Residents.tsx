
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ResidentCard } from "@/components/ResidentCard";
import { AddResidentForm } from "@/components/AddResidentForm";
import { ResidentDetailsModal } from "@/components/ResidentDetailsModal";
import type { Resident } from "@/types/resident";

const mockResidents: Resident[] = [
  {
    id: '1',
    name: 'Maria Santos',
    cpf: '123.456.789-00',
    email: 'maria@email.com',
    phone: '(11) 99999-9999',
    unit: '101',
    building: 'A',
    isOwner: true,
    emergencyContact: {
      name: 'João Santos',
      phone: '(11) 88888-8888',
      relationship: 'Esposo'
    },
    moveInDate: '2023-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Carlos Silva',
    cpf: '987.654.321-00',
    email: 'carlos@email.com',
    phone: '(11) 77777-7777',
    unit: '205',
    building: 'B',
    isOwner: false,
    emergencyContact: {
      name: 'Ana Silva',
      phone: '(11) 66666-6666',
      relationship: 'Esposa'
    },
    moveInDate: '2023-06-01',
    status: 'active'
  }
];

const Residents = () => {
  const [residents, setResidents] = useState<Resident[]>(mockResidents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResidents = useMemo(() => {
    if (!searchTerm) return residents;
    
    return residents.filter(resident =>
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [residents, searchTerm]);

  const handleAddResident = (newResident: Omit<Resident, 'id'>) => {
    const id = Date.now().toString();
    setResidents([{ ...newResident, id }, ...residents]);
  };

  const handleUpdateResident = (id: string, updatedData: Omit<Resident, 'id'>) => {
    setResidents(residents.map(resident => 
      resident.id === id ? { ...updatedData, id } : resident
    ));
  };

  const handleDeleteResident = (id: string) => {
    setResidents(residents.filter(resident => resident.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        onAddPackage={() => setShowAddForm(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        title="Moradores"
        addButtonText="Novo Morador"
      />

      <main className="px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Moradores Cadastrados ({filteredResidents.length})
          </h2>

          {filteredResidents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                {searchTerm ? 'Nenhum morador encontrado' : 'Nenhum morador cadastrado'}
              </div>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Tente buscar por outro termo'
                  : 'Cadastre o primeiro morador clicando no botão "Novo Morador"'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        />
      )}
    </div>
  );
};

export default Residents;
