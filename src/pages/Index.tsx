
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { FilterTabs } from "@/components/FilterTabs";
import { PackageCard } from "@/components/PackageCard";
import { AddPackageForm } from "@/components/AddPackageForm";
import { PackageDetailsModal } from "@/components/PackageDetailsModal";
import { usePermissions } from "@/hooks/usePermissions";
import type { Package, DashboardStats } from "@/types/package";

const mockPackages: Package[] = [
  {
    id: '1',
    recipientName: 'Maria Santos',
    recipientUnit: '101',
    senderCompany: 'Mercado Livre',
    trackingCode: 'ML123456789',
    receivedDate: '2024-01-15',
    receivedTime: '14:30',
    status: 'received',
    description: 'Smartphone Samsung',
    size: 'medium',
    receivedBy: 'Porteiro João',
  },
  {
    id: '2',
    recipientName: 'Carlos Silva',
    recipientUnit: '205',
    senderCompany: 'Amazon',
    trackingCode: 'AMZ987654321',
    receivedDate: '2024-01-15',
    receivedTime: '09:15',
    status: 'collected',
    description: 'Livros',
    size: 'small',
    receivedBy: 'Porteiro Pedro',
    collectedDate: '2024-01-15',
    collectedTime: '16:45',
  },
  {
    id: '3',
    recipientName: 'Ana Oliveira',
    recipientUnit: '302',
    senderCompany: 'Magazine Luiza',
    receivedDate: '2024-01-14',
    receivedTime: '11:20',
    status: 'received',
    description: 'Eletrodoméstico',
    size: 'large',
    receivedBy: 'Porteiro João',
  },
];

const Index = () => {
  const { canDeletePackages } = usePermissions();
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | Package['status']>('all');

  const filteredPackages = useMemo(() => {
    let filtered = packages;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.recipientUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.senderCompany.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.status === activeFilter);
    }

    return filtered;
  }, [packages, searchTerm, activeFilter]);

  const stats: DashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: packages.length,
      received: packages.filter(pkg => pkg.receivedDate === today && pkg.status === 'received').length,
      collected: packages.filter(pkg => pkg.status === 'collected').length,
    };
  }, [packages]);

  const filterCounts = useMemo(() => ({
    all: packages.length,
    received: packages.filter(pkg => pkg.status === 'received').length,
    collected: packages.filter(pkg => pkg.status === 'collected').length,
  }), [packages]);

  const handleAddPackage = (newPackage: Omit<Package, 'id'>) => {
    const id = Date.now().toString();
    setPackages([{ ...newPackage, id }, ...packages]);
  };

  const handleStatusChange = (id: string, status: Package['status']) => {
    setPackages(packages.map(pkg => 
      pkg.id === id 
        ? { 
            ...pkg, 
            status,
            ...(status === 'collected' ? {
              collectedDate: new Date().toISOString().split('T')[0],
              collectedTime: new Date().toTimeString().split(' ')[0].substring(0, 5)
            } : {})
          }
        : pkg
    ));
  };

  const handleUpdatePackage = (id: string, updatedData: Omit<Package, 'id'>) => {
    setPackages(packages.map(pkg => 
      pkg.id === id ? { ...updatedData, id } : pkg
    ));
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
  };

  const handleViewDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        onAddPackage={() => setShowAddForm(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="px-6 py-8">
        <StatsCards stats={stats} />

        <div className="bg-white rounded-lg shadow-sm p-6">
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
          />

          {filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                {searchTerm ? 'Nenhuma encomenda encontrada' : 'Nenhuma encomenda registrada'}
              </div>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Tente buscar por outro termo'
                  : 'Registre a primeira encomenda clicando no botão "Nova Encomenda"'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddForm && (
        <AddPackageForm
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddPackage}
        />
      )}

      {selectedPackage && (
        <PackageDetailsModal
          package={selectedPackage}
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onUpdate={handleUpdatePackage}
          onDelete={handleDeletePackage}
          canDelete={canDeletePackages}
        />
      )}
    </div>
  );
};

export default Index;
