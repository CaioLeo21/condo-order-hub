
import { useState } from "react";
import { Edit, Trash2, Calendar, User, Package as PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Package } from "@/types/package";

interface PackageDetailsModalProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updatedPackage: Omit<Package, 'id'>) => void;
  onDelete: (id: string) => void;
  canDelete?: boolean;
}

export function PackageDetailsModal({
  package: pkg,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  canDelete = true,
}: PackageDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: pkg.recipientName,
    recipientUnit: pkg.recipientUnit,
    senderCompany: pkg.senderCompany,
    trackingCode: pkg.trackingCode || '',
    description: pkg.description || '',
    size: pkg.size,
    receivedBy: pkg.receivedBy
  });

  const handleSave = () => {
    onUpdate(pkg.id, {
      ...formData,
      receivedDate: pkg.receivedDate,
      receivedTime: pkg.receivedTime,
      status: pkg.status,
      collectedDate: pkg.collectedDate,
      collectedTime: pkg.collectedTime
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      recipientName: pkg.recipientName,
      recipientUnit: pkg.recipientUnit,
      senderCompany: pkg.senderCompany,
      trackingCode: pkg.trackingCode || '',
      description: pkg.description || '',
      size: pkg.size,
      receivedBy: pkg.receivedBy
    });
    setIsEditing(false);
  };

  const getStatusConfig = (status: Package['status']) => {
    switch (status) {
      case 'received':
        return { color: 'bg-blue-100 text-blue-800', label: 'Recebida' };
      case 'collected':
        return { color: 'bg-green-100 text-green-800', label: 'Retirada' };
    }
  };

  const getSizeLabel = (size: Package['size']) => {
    return size === 'small' ? 'Pequena' : size === 'medium' ? 'Média' : 'Grande';
  };

  const getSizeColor = (size: Package['size']) => {
    if (size === 'small') return 'bg-gray-100 text-gray-800';
    if (size === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const statusConfig = getStatusConfig(pkg.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center space-x-2">
              <PackageIcon className="h-5 w-5 text-blue-600" />
              <span>Detalhes da Encomenda</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  {canDelete && <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta encomenda? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            onDelete(pkg.id);
                            onClose();
                          }}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>}
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            <Badge className={`${getSizeColor(pkg.size)} font-semibold px-3`}>
              Encomenda {getSizeLabel(pkg.size)}
            </Badge>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientName">Nome do Destinatário *</Label>
                  <Input
                    id="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipientUnit">Unidade *</Label>
                  <Input
                    id="recipientUnit"
                    value={formData.recipientUnit}
                    onChange={(e) => setFormData({...formData, recipientUnit: e.target.value})}
                    required
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
                  />
                </div>
                
                <div>
                  <Label htmlFor="trackingCode">Código de Rastreamento</Label>
                  <Input
                    id="trackingCode"
                    value={formData.trackingCode}
                    onChange={(e) => setFormData({...formData, trackingCode: e.target.value})}
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
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Destinatário</label>
                    <p className="text-gray-900">{pkg.recipientName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unidade</label>
                    <p className="text-gray-900">{pkg.recipientUnit}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Empresa Remetente</label>
                    <p className="text-gray-900">{pkg.senderCompany}</p>
                  </div>
                  
                  {pkg.trackingCode && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Código de Rastreamento</label>
                      <p className="text-gray-900">{pkg.trackingCode}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Recebimento</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(pkg.receivedDate).toLocaleDateString('pt-BR')} às {pkg.receivedTime}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recebido por</label>
                    <p className="text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {pkg.receivedBy}
                    </p>
                  </div>
                  
                  {pkg.status === 'collected' && pkg.collectedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Retirada</label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(pkg.collectedDate).toLocaleDateString('pt-BR')} às {pkg.collectedTime}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {pkg.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Descrição</label>
                  <p className="text-gray-900 mt-1">{pkg.description}</p>
                </div>
              )}

            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
