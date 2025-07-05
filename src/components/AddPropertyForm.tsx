
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Property } from "@/types/property";

interface AddPropertyFormProps {
  onClose: () => void;
  onAdd: (property: Omit<Property, 'id'>) => void;
}

export function AddPropertyForm({ onClose, onAdd }: AddPropertyFormProps) {
  const [formData, setFormData] = useState({
    unit: '',
    building: '',
    floor: 1,
    type: 'apartment' as const,
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    owner: {
      name: '',
      cpf: '',
      email: '',
      phone: ''
    },
    tenant: {
      name: '',
      cpf: '',
      email: '',
      phone: ''
    },
    monthlyFee: 0,
    status: 'vacant' as const,
    notes: ''
  });

  const [hasTenant, setHasTenant] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const propertyData = {
      ...formData,
      tenant: hasTenant ? formData.tenant : undefined
    };
    onAdd(propertyData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOwnerChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      owner: { ...prev.owner, [field]: value }
    }));
  };

  const handleTenantChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      tenant: { ...prev.tenant, [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Novo Imóvel</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="floor">Andar</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bedrooms">Quartos</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Banheiros</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="area">Área (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Proprietário</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nome"
                  value={formData.owner.name}
                  onChange={(e) => handleOwnerChange('name', e.target.value)}
                  required
                />
                <Input
                  placeholder="CPF"
                  value={formData.owner.cpf}
                  onChange={(e) => handleOwnerChange('cpf', e.target.value)}
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.owner.email}
                  onChange={(e) => handleOwnerChange('email', e.target.value)}
                  required
                />
                <Input
                  placeholder="Telefone"
                  value={formData.owner.phone}
                  onChange={(e) => handleOwnerChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="hasTenant"
                  checked={hasTenant}
                  onChange={(e) => setHasTenant(e.target.checked)}
                />
                <Label htmlFor="hasTenant">Possui inquilino</Label>
              </div>
              {hasTenant && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome do Inquilino"
                    value={formData.tenant.name}
                    onChange={(e) => handleTenantChange('name', e.target.value)}
                  />
                  <Input
                    placeholder="CPF do Inquilino"
                    value={formData.tenant.cpf}
                    onChange={(e) => handleTenantChange('cpf', e.target.value)}
                  />
                  <Input
                    placeholder="Email do Inquilino"
                    type="email"
                    value={formData.tenant.email}
                    onChange={(e) => handleTenantChange('email', e.target.value)}
                  />
                  <Input
                    placeholder="Telefone do Inquilino"
                    value={formData.tenant.phone}
                    onChange={(e) => handleTenantChange('phone', e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyFee">Taxa Mensal (R$)</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  step="0.01"
                  value={formData.monthlyFee}
                  onChange={(e) => handleInputChange('monthlyFee', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="vacant">Vago</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Cadastrar Imóvel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
