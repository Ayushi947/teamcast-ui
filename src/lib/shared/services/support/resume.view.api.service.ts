import { ApiService } from '../core/api.service';
import { IClientResumeViewApiResponse } from '../../models/api/client/resume.view.api';

const SUPPORT_RESUME_VIEW_ENDPOINTS = {
  VIEW: '/support/candidates/:candidateId/resume/view',
} as const;

export class SupportResumeViewApiService extends ApiService {
  /**
   * Generate a pre-signed URL to view a candidate's resume
   */
  public async viewResume(
    candidateId: string
  ): Promise<IClientResumeViewApiResponse> {
    try {
      return await this.apiGet<IClientResumeViewApiResponse>(
        SUPPORT_RESUME_VIEW_ENDPOINTS.VIEW.replace(':candidateId', candidateId)
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
