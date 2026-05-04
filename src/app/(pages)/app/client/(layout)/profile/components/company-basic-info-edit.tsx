import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactPhoneInput } from '@/components/ui/contact-phone-input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseMutationResult } from '@tanstack/react-query';
import {
  CompanyIndustryEnum,
  CompanyTypeEnum,
  CompanySizeEnum,
  CompanyStageEnum,
} from '@/lib/shared/models/common/enums';
import { formatEnumValue } from '@/lib/utils';

interface EditFormData {
  name: string;
  description: string;
  industry: string;
  companyType: string;
  size: string;
  stage: string;
  foundedYear: number;
  website: string;
  contactEmail: string;
  contactPhone: string;
  contactName: string;
}

interface CompanyBasicInfoEditProps {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  formErrors: Record<string, string>;
  touched: Record<string, boolean>;
  editFormData: EditFormData;
  handleChange: (field: keyof EditFormData, value: any) => void;
  handleBlur: (field: keyof EditFormData) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  updateProfileMutation: UseMutationResult<any, any, any, any>;
  phoneValidationError: string | null;
  setPhoneValidationError: (error: string | null) => void;
}

export const CompanyBasicInfoEdit = ({
  showEditModal,
  setShowEditModal,
  formErrors,
  touched,
  editFormData,
  handleChange,
  handleBlur,
  handleEditSubmit,
  updateProfileMutation,
  phoneValidationError,
  setPhoneValidationError,
}: CompanyBasicInfoEditProps) => {
  return (
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Edit Company Information
          </DialogTitle>
          <DialogDescription>
            Update your company details to attract better candidates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={editFormData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={
                formErrors.name && touched.name ? 'border-red-500' : ''
              }
            />
            {formErrors.name && touched.name && (
              <p className="text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              value={editFormData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              rows={4}
              className={
                formErrors.description && touched.description
                  ? 'border-red-500'
                  : ''
              }
            />
            {formErrors.description && touched.description && (
              <p className="text-sm text-red-500">{formErrors.description}</p>
            )}
          </div>

          {/* Industry and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={editFormData.industry}
                onValueChange={(value) => handleChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CompanyIndustryEnum).map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {formatEnumValue(industry)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">Company Type</Label>
              <Select
                value={editFormData.companyType}
                onValueChange={(value) => handleChange('companyType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CompanyTypeEnum).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Size and Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select
                value={editFormData.size}
                onValueChange={(value) => handleChange('size', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CompanySizeEnum).map((size) => (
                    <SelectItem key={size} value={size}>
                      {formatEnumValue(size)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Company Stage</Label>
              <Select
                value={editFormData.stage}
                onValueChange={(value) => handleChange('stage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CompanyStageEnum).map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {formatEnumValue(stage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Founded Year and Website */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                type="number"
                value={editFormData.foundedYear || ''}
                onChange={(e) =>
                  handleChange('foundedYear', parseInt(e.target.value) || 0)
                }
                onBlur={() => handleBlur('foundedYear')}
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={editFormData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                onBlur={() => handleBlur('website')}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Contact Information
            </h4>

            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={editFormData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                onBlur={() => handleBlur('contactName')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={editFormData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  onBlur={() => handleBlur('contactEmail')}
                />
              </div>

              <div className="space-y-2">
                <ContactPhoneInput
                  value={editFormData.contactPhone}
                  onChange={(value) => handleChange('contactPhone', value)}
                  onValidationError={setPhoneValidationError}
                  placeholder="Phone number"
                  label="Contact Phone"
                  showLabel={false}
                />
              </div>
            </div>
          </div>

          {/* Form Error */}
          {formErrors.form && (
            <div className="text-sm text-red-500">{formErrors.form}</div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateProfileMutation.isPending || phoneValidationError !== null
              }
              className="min-w-[100px]"
            >
              {updateProfileMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
