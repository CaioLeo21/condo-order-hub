
import { Shield, Calendar, Clock, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Doorman } from "@/types/doorman";

interface DoormanCardProps {
  doorman: Doorman;
  onViewDetails: (doorman: Doorman) => void;
}

export function DoormanCard({ doorman, onViewDetails }: DoormanCardProps) {
  const getStatusConfig = (status: Doorman['status']) => {
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

  const getShiftConfig = (shift: Doorman['shift']) => {
    switch (shift) {
      case 'morning':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Manhã'
        };
      case 'afternoon':
        return {
          color: 'bg-orange-100 text-orange-800',
          label: 'Tarde'
        };
      case 'night':
        return {
          color: 'bg-blue-100 text-blue-800',
          label: 'Noite'
        };
    }
  };

  const statusConfig = getStatusConfig(doorman.status);
  const shiftConfig = getShiftConfig(doorman.shift);

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => onViewDetails(doorman)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{doorman.name}</h3>
              <p className="text-sm text-gray-600">Porteiro</p>
            </div>
          </div>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <span>{doorman.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span>{doorman.phone}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Contratado em: {new Date(doorman.hireDate).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Turno:</span>
            </div>
            <Badge className={shiftConfig.color}>
              {shiftConfig.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
