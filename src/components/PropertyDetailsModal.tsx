
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Save, X } from "lucide-react";
import type { Property } from "@/types/property";

interface PropertyDetailsModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Omit<Property, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function PropertyDetailsModal({ 
  property, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete 
}: PropertyDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(property);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied': return 'Ocupado';
      case 'vacant': return 'Vago';
      case 'maintenance': return 'Manutenção';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Apartamento';
      case 'house': return 'Casa';
      case 'commercial': return 'Comercial';
      default: return type;
    }
  };

  const handleSave = () => {
    onUpdate(property.id, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      onDelete(property.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Detalhes do Imóvel
            <div className="flex space-x-2">
              {!isEditing && (
                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant="outline" size="icon" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge className={
              property.status === 'occupied' ? 'bg-green-100 text-green-800' :
              property.status === 'vacant' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {getStatusLabel(property.status)}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {getTypeLabel(property.type)}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Unidade</Label>
              <p className="text-sm text-gray-600">
                {property.unit}{property.building ? ` - Bloco ${property.building}` : ''}
              </p>
            </div>
            <div>
              <Label>Andar</Label>
              <p className="text-sm text-gray-600">{property.floor}º</p>
            </div>
            <div>
              <Label>Área</Label>
              <p className="text-sm text-gray-600">{property.area}m²</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quartos</Label>
              <p className="text-sm text-gray-600">{property.bedrooms}</p>
            </div>
            <div>
              <Label>Banheiros</Label>
              <p className="text-sm text-gray-600">{property.bathrooms}</p>
            </div>
          </div>

          <div>
            <Label>Proprietário</Label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p><strong>Nome:</strong> {property.owner.name}</p>
              <p><strong>CPF:</strong> {property.owner.cpf}</p>
              <p><strong>Email:</strong> {property.owner.email}</p>
              <p><strong>Telefone:</strong> {property.owner.phone}</p>
            </div>
          </div>

          {property.tenant && (
            <div>
              <Label>Inquilino</Label>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p><strong>Nome:</strong> {property.tenant.name}</p>
                <p><strong>CPF:</strong> {property.tenant.cpf}</p>
                <p><strong>Email:</strong> {property.tenant.email}</p>
                <p><strong>Telefone:</strong> {property.tenant.phone}</p>
              </div>
            </div>
          )}

          <div>
            <Label>Taxa Mensal</Label>
            <p className="text-lg font-semibold text-green-600">
              R$ {property.monthlyFee.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {property.notes && (
            <div>
              <Label>Observações</Label>
              <p className="text-sm text-gray-600">{property.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
