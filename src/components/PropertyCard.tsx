
import { Building2, User, Users, Bed, Bath, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
}

export function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const getStatusConfig = (status: Property['status']) => {
    switch (status) {
      case 'occupied':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Ocupado'
        };
      case 'vacant':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Vago'
        };
      case 'maintenance':
        return {
          color: 'bg-red-100 text-red-800',
          label: 'Manutenção'
        };
    }
  };

  const getTypeLabel = (type: Property['type']) => {
    switch (type) {
      case 'apartment':
        return 'Apartamento';
      case 'house':
        return 'Casa';
      case 'commercial':
        return 'Comercial';
    }
  };

  const statusConfig = getStatusConfig(property.status);

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => onViewDetails(property)}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Unidade {property.unit}
                {property.building ? ` - Bloco ${property.building}` : ''}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">{getTypeLabel(property.type)}</p>
            </div>
          </div>
          <Badge className={`${statusConfig.color} flex-shrink-0`}>
            {statusConfig.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center text-gray-600">
                <Bed className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Bath className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{property.area}m²</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Proprietário: {property.owner.name}</span>
          </div>

          {property.tenant && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Inquilino: {property.tenant.name}</span>
            </div>
          )}

          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Taxa Mensal:</span>
              <span className="font-semibold text-green-600 text-sm sm:text-base">
                R$ {property.monthlyFee.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
