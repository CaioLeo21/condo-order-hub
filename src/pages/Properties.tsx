
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { PropertyCard } from "@/components/PropertyCard";
import { AddPropertyForm } from "@/components/AddPropertyForm";
import { PropertyDetailsModal } from "@/components/PropertyDetailsModal";
import type { Property } from "@/types/property";

const mockProperties: Property[] = [
  {
    id: '1',
    unit: '101',
    building: 'A',
    floor: 1,
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    owner: {
      name: 'Maria Santos',
      cpf: '123.456.789-00',
      email: 'maria@email.com',
      phone: '(11) 99999-9999'
    },
    monthlyFee: 350.00,
    status: 'occupied'
  },
  {
    id: '2',
    unit: '205',
    building: 'B',
    floor: 2,
    type: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: 85,
    owner: {
      name: 'José Silva',
      cpf: '987.654.321-00',
      email: 'jose@email.com',
      phone: '(11) 88888-8888'
    },
    tenant: {
      name: 'Carlos Silva',
      cpf: '456.789.123-00',
      email: 'carlos@email.com',
      phone: '(11) 77777-7777'
    },
    monthlyFee: 450.00,
    status: 'occupied'
  }
];

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;
    
    return properties.filter(property =>
      property.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [properties, searchTerm]);

  const handleAddProperty = (newProperty: Omit<Property, 'id'>) => {
    const id = Date.now().toString();
    setProperties([{ ...newProperty, id }, ...properties]);
  };

  const handleUpdateProperty = (id: string, updatedData: Omit<Property, 'id'>) => {
    setProperties(properties.map(property => 
      property.id === id ? { ...updatedData, id } : property
    ));
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(property => property.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        onAddPackage={() => setShowAddForm(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        title="Imóveis"
        addButtonText="Novo Imóvel"
      />

      <main className="px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Imóveis Cadastrados ({filteredProperties.length})
          </h2>

          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                {searchTerm ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}
              </div>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Tente buscar por outro termo'
                  : 'Cadastre o primeiro imóvel clicando no botão "Novo Imóvel"'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={setSelectedProperty}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddForm && (
        <AddPropertyForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddProperty}
        />
      )}

      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onUpdate={handleUpdateProperty}
          onDelete={handleDeleteProperty}
        />
      )}
    </div>
  );
};

export default Properties;
