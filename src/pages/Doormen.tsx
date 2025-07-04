
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { DoormanCard } from "@/components/DoormanCard";
import { AddDoormanForm } from "@/components/AddDoormanForm";
import { DoormanDetailsModal } from "@/components/DoormanDetailsModal";
import type { Doorman } from "@/types/doorman";

const mockDoormen: Doorman[] = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '111.222.333-44',
    email: 'joao@email.com',
    phone: '(11) 55555-5555',
    shift: 'morning',
    hireDate: '2023-01-10',
    emergencyContact: {
      name: 'Maria Silva',
      phone: '(11) 44444-4444',
      relationship: 'Esposa'
    },
    status: 'active'
  },
  {
    id: '2',
    name: 'Pedro Santos',
    cpf: '555.666.777-88',
    email: 'pedro@email.com',
    phone: '(11) 33333-3333',
    shift: 'night',
    hireDate: '2023-03-15',
    emergencyContact: {
      name: 'Ana Santos',
      phone: '(11) 22222-2222',
      relationship: 'Filha'
    },
    status: 'active'
  }
];

const Doormen = () => {
  const [doormen, setDoormen] = useState<Doorman[]>(mockDoormen);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDoorman, setSelectedDoorman] = useState<Doorman | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoormen = useMemo(() => {
    if (!searchTerm) return doormen;
    
    return doormen.filter(doorman =>
      doorman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doorman.shift.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doorman.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doormen, searchTerm]);

  const handleAddDoorman = (newDoorman: Omit<Doorman, 'id'>) => {
    const id = Date.now().toString();
    setDoormen([{ ...newDoorman, id }, ...doormen]);
  };

  const handleUpdateDoorman = (id: string, updatedData: Omit<Doorman, 'id'>) => {
    setDoormen(doormen.map(doorman => 
      doorman.id === id ? { ...updatedData, id } : doorman
    ));
  };

  const handleDeleteDoorman = (id: string) => {
    setDoormen(doormen.filter(doorman => doorman.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        onAddPackage={() => setShowAddForm(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        title="Porteiros"
        addButtonText="Novo Porteiro"
      />

      <main className="px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Porteiros Cadastrados ({filteredDoormen.length})
          </h2>

          {filteredDoormen.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                {searchTerm ? 'Nenhum porteiro encontrado' : 'Nenhum porteiro cadastrado'}
              </div>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Tente buscar por outro termo'
                  : 'Cadastre o primeiro porteiro clicando no botão "Novo Porteiro"'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoormen.map((doorman) => (
                <DoormanCard
                  key={doorman.id}
                  doorman={doorman}
                  onViewDetails={setSelectedDoorman}
                />
              ))}
            </div>
          )}
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
