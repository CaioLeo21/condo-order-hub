
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Save, X } from "lucide-react";
import type { Resident } from "@/types/resident";

interface ResidentDetailsModalProps {
  resident: Resident;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Omit<Resident, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function ResidentDetailsModal({ 
  resident, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete 
}: ResidentDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(resident);

  const handleSave = () => {
    onUpdate(resident.id, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este morador?')) {
      onDelete(resident.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Detalhes do Morador
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
            <Badge className={resident.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {resident.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {resident.isOwner ? 'Proprietário' : 'Inquilino'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <p className="text-sm text-gray-600">{resident.name}</p>
              )}
            </div>
            <div>
              <Label>CPF</Label>
              {isEditing ? (
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                />
              ) : (
                <p className="text-sm text-gray-600">{resident.cpf}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              ) : (
                <p className="text-sm text-gray-600">{resident.email}</p>
              )}
            </div>
            <div>
              <Label>Telefone</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              ) : (
                <p className="text-sm text-gray-600">{resident.phone}</p>
              )}
            </div>
            <div>
              <Label>Unidade</Label>
              {isEditing ? (
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                />
              ) : (
                <p className="text-sm text-gray-600">
                  {resident.unit}{resident.building ? ` - Bloco ${resident.building}` : ''}
                </p>
              )}
            </div>
            <div>
              <Label>Data de Mudança</Label>
              <p className="text-sm text-gray-600">
                {new Date(resident.moveInDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div>
            <Label>Contato de Emergência</Label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p><strong>Nome:</strong> {resident.emergencyContact.name}</p>
              <p><strong>Telefone:</strong> {resident.emergencyContact.phone}</p>
              <p><strong>Relacionamento:</strong> {resident.emergencyContact.relationship}</p>
            </div>
          </div>

          {resident.notes && (
            <div>
              <Label>Observações</Label>
              <p className="text-sm text-gray-600">{resident.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
