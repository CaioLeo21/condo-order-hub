
import { useState } from "react";
import { X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Package } from "@/types/package";

interface AddPackageFormProps {
  onClose: () => void;
  onAdd: (package: Omit<Package, 'id'>) => void;
}

export function AddPackageForm({ onClose, onAdd }: AddPackageFormProps) {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientUnit: '',
    senderCompany: '',
    trackingCode: '',
    description: '',
    size: 'medium' as Package['size'],
    receivedBy: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const newPackage: Omit<Package, 'id'> = {
      ...formData,
      receivedDate: now.toISOString().split('T')[0],
      receivedTime: now.toTimeString().split(' ')[0].substring(0, 5),
      status: 'received'
    };

    onAdd(newPackage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Registrar Nova Encomenda</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">Nome do Destinatário *</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                  required
                  placeholder="Ex: João da Silva"
                />
              </div>
              
              <div>
                <Label htmlFor="recipientUnit">Unidade *</Label>
                <Input
                  id="recipientUnit"
                  value={formData.recipientUnit}
                  onChange={(e) => setFormData({...formData, recipientUnit: e.target.value})}
                  required
                  placeholder="Ex: 101, Torre A"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="senderCompany">Empresa Remetente *</Label>
                <Input
                  id="senderCompany"
                  value={formData.senderCompany}
                  onChange={(e) => setFormData({...formData, senderCompany: e.target.value})}
                  required
                  placeholder="Ex: Mercado Livre, Amazon"
                />
              </div>
              
              <div>
                <Label htmlFor="trackingCode">Código de Rastreamento</Label>
                <Input
                  id="trackingCode"
                  value={formData.trackingCode}
                  onChange={(e) => setFormData({...formData, trackingCode: e.target.value})}
                  placeholder="Ex: BR123456789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Tamanho da Encomenda *</Label>
                <Select value={formData.size} onValueChange={(value: Package['size']) => setFormData({...formData, size: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequena</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="receivedBy">Recebido por *</Label>
                <Input
                  id="receivedBy"
                  value={formData.receivedBy}
                  onChange={(e) => setFormData({...formData, receivedBy: e.target.value})}
                  required
                  placeholder="Ex: Porteiro João"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição da encomenda (opcional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Observações adicionais (opcional)"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                Registrar Encomenda
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
