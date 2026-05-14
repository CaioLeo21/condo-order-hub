
import { Shield, Clock, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Doorman } from "@/types/doorman";

interface DoormanCardProps {
  doorman: Doorman;
  onViewDetails: (doorman: Doorman) => void;
}

export function DoormanCard({ doorman, onViewDetails }: DoormanCardProps) {
  const getShiftConfig = (shift: Doorman['shift']) => {
    switch (shift) {
      case 'morning':   return { color: 'bg-yellow-100 text-yellow-800', label: 'Manhã' };
      case 'afternoon': return { color: 'bg-orange-100 text-orange-800', label: 'Tarde' };
      case 'night':     return { color: 'bg-blue-100 text-blue-800',     label: 'Noite' };
    }
  };

  const shiftConfig = getShiftConfig(doorman.shift);

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => onViewDetails(doorman)}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{doorman.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">Porteiro</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Badge className={doorman.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {doorman.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge className={shiftConfig.color}>
              {shiftConfig.label}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span>{doorman.phone}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span>{shiftConfig.label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
