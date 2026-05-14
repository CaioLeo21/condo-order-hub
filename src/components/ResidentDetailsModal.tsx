
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2, Save, X } from "lucide-react";
import type { Resident } from "@/types/resident";

interface ResidentDetailsModalProps {
  resident: Resident;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Omit<Resident, 'id'>) => void;
  onDelete: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

function residentTypeLabel(type: Resident['residentType'], description?: string) {
  if (type === 'owner') return 'Proprietário';
  if (type === 'tenant') return 'Inquilino';
  return 'Outro';
}

export function ResidentDetailsModal({
  resident,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  canEdit = true,
  canDelete = true,
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
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Detalhes do Morador</DialogTitle>
            <div className="flex space-x-2">
              {canEdit && !isEditing && (
                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {canEdit && isEditing && (
                <>
                  <Button variant="outline" size="icon" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              {canDelete && (
                <Button variant="destructive" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge className={resident.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {resident.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {residentTypeLabel(resident.residentType, resident.residentTypeDescription)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600">{resident.name}</p>
              )}
            </div>
            <div>
              <Label>Telefone</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600">
                  {resident.unit}
                </p>
              )}
            </div>
            <div>
              <Label>Bloco</Label>
              {isEditing ? (
                <Input
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600">
                  {resident.building}
                </p>
              )}
            </div>
            <div>
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={formData.status}
                  onValueChange={(value: Resident['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600">
                  {resident.status === 'active' ? 'Ativo' : 'Inativo'}
                </p>
              )}
            </div>
            <div>
              <Label>Tipo de morador</Label>
              {isEditing ? (
                <Select
                  value={formData.residentType}
                  onValueChange={(value: Resident['residentType']) =>
                    setFormData({ ...formData, residentType: value, residentTypeDescription: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Proprietário</SelectItem>
                    <SelectItem value="tenant">Inquilino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600">
                  {residentTypeLabel(resident.residentType, resident.residentTypeDescription)}
                </p>
              )}
            </div>
          </div>

          {isEditing && formData.residentType === 'other' && (
            <div>
              <Label>Descrição do morador</Label>
              <Input
                value={formData.residentTypeDescription ?? ''}
                onChange={(e) => setFormData({ ...formData, residentTypeDescription: e.target.value })}
                placeholder="Ex: Familiar, Funcionário..."
              />
            </div>
          )}

          {!isEditing && resident.residentType === 'other' && resident.residentTypeDescription && (
            <div>
              <Label>Descrição do morador</Label>
              <p className="text-sm text-gray-600">{resident.residentTypeDescription}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
