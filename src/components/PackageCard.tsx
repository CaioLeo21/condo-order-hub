
import { Package, Calendar, User, Building, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Package as PackageType } from "@/types/package";

interface PackageCardProps {
  package: PackageType;
  onStatusChange: (id: string, status: PackageType['status']) => void;
  onViewDetails: (pkg: PackageType) => void;
}

export function PackageCard({ package: pkg, onStatusChange, onViewDetails }: PackageCardProps) {
  const getStatusConfig = (status: PackageType['status']) => {
    switch (status) {
      case 'received':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          label: 'Recebida'
        };
      case 'collected':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Retirada'
        };
      case 'pending':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertCircle,
          label: 'Pendente'
        };
    }
  };

  const getSizeColor = (size: PackageType['size']) => {
    switch (size) {
      case 'small':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'large':
        return 'bg-red-100 text-red-800';
    }
  };

  const statusConfig = getStatusConfig(pkg.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => onViewDetails(pkg)}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{pkg.recipientName}</h3>
              <p className="text-xs sm:text-sm text-gray-600">Unidade {pkg.recipientUnit}</p>
            </div>
          </div>
          <Badge className={`${statusConfig.color} flex-shrink-0`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">{statusConfig.label}</span>
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{pkg.senderCompany}</span>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span>{new Date(pkg.receivedDate).toLocaleDateString('pt-BR')} às {pkg.receivedTime}</span>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Recebido por: {pkg.receivedBy}</span>
          </div>

          {pkg.trackingCode && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Código: {pkg.trackingCode}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Badge className={getSizeColor(pkg.size)}>
            {pkg.size === 'small' ? 'Pequena' : 
             pkg.size === 'medium' ? 'Média' : 'Grande'}
          </Badge>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
            {pkg.status === 'received' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(pkg.id, 'collected')}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-xs"
              >
                <span className="sm:hidden">Retirada</span>
                <span className="hidden sm:inline">Marcar como Retirada</span>
              </Button>
            )}
            
            {pkg.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(pkg.id, 'received')}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-xs"
              >
                <span className="sm:hidden">Receber</span>
                <span className="hidden sm:inline">Confirmar Recebimento</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
