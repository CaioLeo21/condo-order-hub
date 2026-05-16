
import { useState, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsCards } from "@/components/StatsCards";
import { FilterTabs } from "@/components/FilterTabs";
import { DatePicker } from "@/components/DatePicker";
import { usePermissions } from "@/hooks/usePermissions";
import { AddPackageForm } from "@/components/AddPackageForm";
import { PaginatedTable, FilterField } from "@/components/PaginatedTable";
import type { Column } from "@/components/PaginatedTable";
import type { Package, DashboardStats } from "@/types/package";
import { PackageDetailsModal } from "@/components/PackageDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function parsePackageDate(dateStr: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr + 'T00:00:00');
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }
  return null;
}

const sizeLabel: Record<Package['size'], string> = {
  small:  'Pequeno',
  medium: 'Médio',
  large:  'Grande',
};

const mockPackages: Package[] = [
  { id: '1',  recipientName: 'Maria Santos',   recipientUnit: '101', senderCompany: 'Mercado Livre',   trackingCode: 'ML123456789',  receivedDate: '01/01/2036', receivedTime: '14:30', status: 'received',  description: 'Smartphone Samsung',  size: 'medium', receivedBy: 'Porteiro João' },
  { id: '2',  recipientName: 'Carlos Silva',    recipientUnit: '205', senderCompany: 'Amazon',          trackingCode: 'AMZ987654321', receivedDate: '2024-01-15', receivedTime: '09:15', status: 'collected', description: 'Livros',              size: 'small',  receivedBy: 'Porteiro Pedro', collectedDate: '2024-01-15', collectedTime: '16:45' },
  { id: '3',  recipientName: 'Ana Oliveira',    recipientUnit: '302', senderCompany: 'Magazine Luiza',                               receivedDate: '2024-01-14', receivedTime: '11:20', status: 'received',  description: 'Eletrodoméstico',     size: 'large',  receivedBy: 'Porteiro João' },
  { id: '4',  recipientName: 'Lucas Pereira',   recipientUnit: '410', senderCompany: 'Shopee',          trackingCode: 'SHP111222333', receivedDate: '2024-01-14', receivedTime: '08:00', status: 'received',  description: 'Roupas',              size: 'small',  receivedBy: 'Porteiro Pedro' },
  { id: '5',  recipientName: 'Fernanda Lima',   recipientUnit: '115', senderCompany: 'Correios',        trackingCode: 'BR444555666',  receivedDate: '2024-01-13', receivedTime: '16:00', status: 'collected', description: 'Documentos',          size: 'small',  receivedBy: 'Porteiro João',  collectedDate: '2024-01-14', collectedTime: '10:00' },
  { id: '6',  recipientName: 'Roberto Costa',   recipientUnit: '501', senderCompany: 'iFood Shop',                                   receivedDate: '2024-01-13', receivedTime: '12:30', status: 'received',  description: 'Suplementos',         size: 'medium', receivedBy: 'Porteiro Pedro' },
  { id: '7',  recipientName: 'Juliana Martins', recipientUnit: '203', senderCompany: 'Netshoes',        trackingCode: 'NET777888999', receivedDate: '2024-01-12', receivedTime: '10:45', status: 'received',  description: 'Tênis',               size: 'medium', receivedBy: 'Porteiro João' },
  { id: '8',  recipientName: 'Paulo Souza',     recipientUnit: '308', senderCompany: 'Amazon',          trackingCode: 'AMZ000111222', receivedDate: '2024-01-12', receivedTime: '14:00', status: 'collected', description: 'Fone de ouvido',      size: 'small',  receivedBy: 'Porteiro Pedro', collectedDate: '2024-01-13', collectedTime: '09:30' },
  { id: '9',  recipientName: 'Camila Rocha',    recipientUnit: '404', senderCompany: 'Mercado Livre',   trackingCode: 'ML333444555', receivedDate: '2024-01-11', receivedTime: '09:00', status: 'received',  description: 'Cadeira de escritório', size: 'large', receivedBy: 'Porteiro João' },
  { id: '10', recipientName: 'Diego Alves',     recipientUnit: '112', senderCompany: 'Shopee',          trackingCode: 'SHP666777888', receivedDate: '2024-01-11', receivedTime: '17:15', status: 'received',  description: 'Utensílios',          size: 'small',  receivedBy: 'Porteiro Pedro' },
  { id: '11', recipientName: 'Beatriz Nunes',   recipientUnit: '206', senderCompany: 'Correios',        trackingCode: 'BR999000111', receivedDate: '2024-01-10', receivedTime: '11:00', status: 'collected', description: 'Livros',              size: 'small',  receivedBy: 'Porteiro João',  collectedDate: '2024-01-11', collectedTime: '14:00' },
  { id: '12', recipientName: 'Thiago Ferreira', recipientUnit: '315', senderCompany: 'Magazine Luiza',                               receivedDate: '2024-01-10', receivedTime: '08:30', status: 'received',  description: 'TV 50"',              size: 'large',  receivedBy: 'Porteiro Pedro' },
];

const Index = () => {
  const { canDeletePackages } = usePermissions();
  const [showAddForm, setShowAddForm] = useState(false);
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | Package['status']>('all');

  const [doormanFilter, setDoormanFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [recipientFilter, setRecipientFilter] = useState('');
  const [senderFilter, setSenderFilter] = useState('');

  const doormanOptions = useMemo(() =>
    [...new Set(packages.map(p => p.receivedBy).filter(Boolean))].sort(),
  [packages]);

  const activeFilterCount = [
    doormanFilter !== 'all',
    !!dateFrom,
    !!dateTo,
    !!recipientFilter,
    !!senderFilter,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setDoormanFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setRecipientFilter('');
    setSenderFilter('');
  };

  const filteredPackages = useMemo(() => {
    let filtered = packages;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.status === activeFilter);
    }

    if (doormanFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.receivedBy === doormanFilter);
    }

    if (recipientFilter) {
      filtered = filtered.filter(pkg =>
        pkg.recipientName.toLowerCase().includes(recipientFilter.toLowerCase()) ||
        pkg.recipientUnit.toLowerCase().includes(recipientFilter.toLowerCase())
      );
    }

    if (senderFilter) {
      filtered = filtered.filter(pkg =>
        pkg.senderCompany.toLowerCase().includes(senderFilter.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(pkg => {
        const d = parsePackageDate(pkg.receivedDate);
        return d ? d >= dateFrom : true;
      });
    }

    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(pkg => {
        const d = parsePackageDate(pkg.receivedDate);
        return d ? d <= end : true;
      });
    }

    return filtered;
  }, [packages, activeFilter, doormanFilter, recipientFilter, senderFilter, dateFrom, dateTo]);

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

  const handleStatusChange = (id: string, status: Package['status']) => {
    setPackages(packages.map(pkg =>
      pkg.id === id
        ? {
            ...pkg,
            status,
            ...(status === 'collected' ? {
              collectedDate: new Date().toISOString().split('T')[0],
              collectedTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
            } : {}),
          }
        : pkg
    ));
  };

  const handleUpdatePackage = (id: string, updatedData: Omit<Package, 'id'>) => {
    setPackages(packages.map(pkg => pkg.id === id ? { ...updatedData, id } : pkg));
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
    setSelectedPackage(null);
  };

  const columns: Column<Package>[] = [
    {
      header: 'Destinatário',
      render: (pkg) => (
        <div>
          <p className="font-medium text-gray-900">{pkg.recipientName}</p>
          <p className="text-xs text-gray-500">Unidade {pkg.recipientUnit}</p>
        </div>
      ),
    },
    {
      header: 'Remetente',
      render: (pkg) => (
        <div>
          <p className="text-gray-700">{pkg.senderCompany}</p>
          {pkg.trackingCode && (
            <p className="text-xs text-gray-400 font-mono">{pkg.trackingCode}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Recebido em',
      render: (pkg) => (
        <div>
          <p className="text-gray-700">{pkg.receivedDate}</p>
          <p className="text-xs text-gray-500">{pkg.receivedTime}</p>
        </div>
      ),
    },
    {
      header: 'Retirado em',
      render: (pkg) => (
        <div>
          <p className="text-gray-700">{pkg.collectedDate ? pkg.collectedDate : 'Não retirado'}</p>
          <p className="text-xs text-gray-500">{pkg.collectedTime ? pkg.collectedTime : ''}</p>
        </div>
      ),
    },
    {
      header: 'Tamanho',
      render: (pkg) => (
        <span className="text-gray-600 text-sm">{sizeLabel[pkg.size]}</span>
      ),
    },
    {
      header: 'Status',
      render: (pkg) => (
        <Badge className={pkg.status === 'received' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
          {pkg.status === 'received' ? 'Aguardando' : 'Retirado'}
        </Badge>
      ),
    },
    {
      header: '',
      render: (pkg) =>
        pkg.status === 'received' ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-green-700 hover:text-green-900 hover:bg-green-50 gap-1"
            onClick={(e) => { e.stopPropagation(); handleStatusChange(pkg.id, 'collected'); }}
          >
            <CheckCircle className="h-4 w-4" />
            Confirmar retirada
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onAddPackage={() => setShowAddForm(true)} />

      <main className="px-6 py-8">
        <StatsCards stats={stats} />

        <div className="bg-white rounded-lg shadow-sm p-6">
          <PaginatedTable
            data={filteredPackages}
            columns={columns}
            onRowClick={setSelectedPackage}
            emptyMessage="Nenhuma encomenda registrada"
            emptyFilterMessage="Nenhuma encomenda encontrada"
            toolbar={
              <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={filterCounts}
              />
            }
            filters={{
              activeCount: activeFilterCount,
              onClear: handleClearFilters,
              children: (
                <>
                  <FilterField label="Porteiro">
                    <Select value={doormanFilter} onValueChange={setDoormanFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os porteiros" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os porteiros</SelectItem>
                        {doormanOptions.map(name => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterField>

                  <FilterField label="Destinatário">
                    <Input
                      placeholder="Nome ou unidade"
                      value={recipientFilter}
                      onChange={e => setRecipientFilter(e.target.value)}
                    />
                  </FilterField>

                  <FilterField label="Remetente">
                    <Input
                      placeholder="Empresa ou transportadora"
                      value={senderFilter}
                      onChange={e => setSenderFilter(e.target.value)}
                    />
                  </FilterField>

                  <FilterField label="Data de recebimento — de">
                    <DatePicker
                      value={dateFrom}
                      onChange={setDateFrom}
                      placeholder="Data inicial"
                    />
                  </FilterField>

                  <FilterField label="Data de recebimento — até">
                    <DatePicker
                      value={dateTo}
                      onChange={setDateTo}
                      placeholder="Data final"
                    />
                  </FilterField>
                </>
              ),
            }}
          />
        </div>
      </main>

      {showAddForm && (
        <AddPackageForm
          onClose={() => setShowAddForm(false)}
          onAdd={(newPackage) => setPackages([{ ...newPackage, id: Date.now().toString() }, ...packages])}
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
