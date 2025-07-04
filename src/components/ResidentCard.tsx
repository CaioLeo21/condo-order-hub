
import { User, Calendar, Building, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Resident } from "@/types/resident";

interface ResidentCardProps {
  resident: Resident;
  onViewDetails: (resident: Resident) => void;
}

export function ResidentCard({ resident, onViewDetails }: ResidentCardProps) {
  const getStatusConfig = (status: Resident['status']) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Ativo'
        };
      case 'inactive':
        return {
          color: 'bg-gray-100 text-gray-800',
          label: 'Inativo'
        };
    }
  };

  const statusConfig = getStatusConfig(resident.status);

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => onViewDetails(resident)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{resident.name}</h3>
              <p className="text-sm text-gray-600">
                Unidade {resident.unit}{resident.building ? ` - Bloco ${resident.building}` : ''}
              </p>
            </div>
          </div>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <span>{resident.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span>{resident.phone}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Desde: {new Date(resident.moveInDate).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Building className="h-4 w-4 mr-2" />
            <span>{resident.isOwner ? 'Proprietário' : 'Inquilino'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
