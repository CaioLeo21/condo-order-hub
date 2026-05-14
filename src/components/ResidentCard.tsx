
import { User, Building, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Resident } from "@/types/resident";

interface ResidentCardProps {
  resident: Resident;
  onViewDetails: (resident: Resident) => void;
}

export function ResidentCard({ resident, onViewDetails }: ResidentCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => onViewDetails(resident)}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{resident.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Unidade {resident.unit}{resident.building ? ` - Bloco ${resident.building}` : ''}
              </p>
            </div>
          </div>
          <Badge className={`flex-shrink-0 ${resident.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {resident.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span>{resident.phone}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span>
              {resident.residentType === 'owner' ? 'Proprietário'
                : resident.residentType === 'tenant' ? 'Inquilino'
                : resident.residentTypeDescription || 'Outro'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
