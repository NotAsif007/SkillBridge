import api from './client';

/**
 * adminApi
 *
 * All HTTP calls for the College Admin portal.
 * Follows the same conventions as student.js and auth.js:
 *   - All methods return the Axios promise.
 *   - The response interceptor in client.js unwraps `response.data`, so
 *     callers receive the full `{ success, data, pagination?, message }` envelope.
 *   - Errors are rejected as `{ code, message }`.
 *
 * Endpoint contracts are sourced from docs/API_CONTRACT.md and docs/ARCHITECTURE.md.
 *
 * ─── Contract status ─────────────────────────────────────────────────────────
 *  ✅ Fully contracted  → getDashboard, getStudents, getDepartments
 *  ⚠️ Route documented, contract pending confirmation with backend (Person 1):
 *      getAnalytics, getAssessmentAnalytics, getInterviewAnalytics, getJobs
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const adminApi = {
  // ── Fully contracted endpoints (docs/API_CONTRACT.md §13) ──────────────────

  /**
   * GET /api/v1/dashboard/admin
   * College admin overview: totalStudents, placementReadyCount/Percentage,
   * averageReadinessScore, activeJobMatches, departmentBreakdown,
   * topSkillGaps, readinessDistribution.
   */
  getDashboard: () => api.get('/dashboard/admin'),

  /**
   * GET /api/v1/admin/students
   * Paginated student roster, scoped to admin's organization.
   *
   * @param {object} [params]
   * @param {number} [params.page]
   * @param {number} [params.limit]
   * @param {string} [params.departmentId]
   * @param {string} [params.search]
   * @param {number} [params.minReadiness]
   */
  getStudents: (params) => api.get('/admin/students', { params }),

  /**
   * GET /api/v1/admin/departments
   * Department list for the organization (name, code, headOfDepartment, studentCount).
   */
  getDepartments: () => api.get('/admin/departments'),

  // ── Pending-contract endpoints (docs/ARCHITECTURE.md §2, Admin Frontend table) ──
  // Route paths are specified in ARCHITECTURE.md.
  // Request params and response shapes are NOT yet defined in API_CONTRACT.md.
  // These stubs will be updated once Person 1 confirms the contract.

  /**
   * GET /api/v1/admin/analytics
   * Placement readiness trends and skill distribution analytics.
   *
   * ⚠️  API contract not yet finalized — do not rely on response shape.
   *
   * @param {object} [params] - Query params TBD with backend.
   */
  getAnalytics: (params) => api.get('/admin/analytics', { params }),

  /**
   * GET /api/v1/admin/assessments/analytics
   * Assessment pass rates, average scores, skill coverage across the org.
   *
   * ⚠️  API contract not yet finalized — do not rely on response shape.
   *
   * @param {object} [params] - Query params TBD with backend.
   */
  getAssessmentAnalytics: (params) => api.get('/admin/assessments/analytics', { params }),

  /**
   * GET /api/v1/admin/interviews/analytics
   * AI interview performance reports and completion rates.
   *
   * ⚠️  API contract not yet finalized — do not rely on response shape.
   *
   * @param {object} [params] - Query params TBD with backend.
   */
  getInterviewAnalytics: (params) => api.get('/admin/interviews/analytics', { params }),

  /**
   * GET /api/v1/admin/jobs
   * Campus drives and placement job listings scoped to the organization.
   *
   * ⚠️  API contract not yet finalized — do not rely on response shape.
   *
   * @param {object} [params] - Query params TBD with backend.
   */
  getJobs: (params) => api.get('/admin/jobs', { params }),
};
