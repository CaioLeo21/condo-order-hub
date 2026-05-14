
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Resident } from "@/types/resident";

interface AddResidentFormProps {
  onClose: () => void;
  onAdd: (resident: Omit<Resident, 'id'>) => void;
}

export function AddResidentForm({ onClose, onAdd }: AddResidentFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    unit: string;
    building: string;
    residentType: 'owner' | 'tenant' | 'other';
    residentTypeDescription: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    phone: '',
    unit: '',
    building: '',
    residentType: 'owner',
    residentTypeDescription: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Novo Morador</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="building">Bloco</Label>
                <Input
                  id="building"
                  value={formData.building}
                  onChange={(e) => handleInputChange('building', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="residentType">Tipo de morador</Label>
                <Select
                  value={formData.residentType}
                  onValueChange={(value) => handleInputChange('residentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Proprietário</SelectItem>
                    <SelectItem value="tenant">Inquilino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.residentType === 'other' && (
              <div>
                <Label htmlFor="residentTypeDescription">Descrição</Label>
                <Input
                  id="residentTypeDescription"
                  value={formData.residentTypeDescription}
                  onChange={(e) => handleInputChange('residentTypeDescription', e.target.value)}
                  placeholder="Ex: Familiar, Funcionário..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Cadastrar Morador
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
