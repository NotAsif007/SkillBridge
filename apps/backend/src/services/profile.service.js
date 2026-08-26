import { StudentProfile } from '../models/studentProfile.model.js';
import { Department } from '../models/department.model.js';
import { User } from '../models/user.model.js';
import { Skill } from '../models/skill.model.js';
import { Career } from '../models/career.model.js';
import { notFound, badRequest } from '../utils/errors.js';

export class ProfileService {
  /**
   * Retrieves or initializes a student profile for a given user ID.
   * A target career remains deliberately unset until the student chooses one.
   */
  static async getOrCreateProfile(userId) {
    let profile = await StudentProfile.findOne({ userId })
      .populate('targetCareerId', 'title slug category overview averageSalaryRange')
      .populate('organizationId', 'name slug domain')
      .populate('departmentId', 'name code');

    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        throw notFound('User not found');
      }

      profile = await StudentProfile.create({
        userId: user._id,
        organizationId: user.organizationId || null,
        departmentId: user.departmentId || null,
      });

      profile = await StudentProfile.findById(profile._id)
        .populate('targetCareerId', 'title slug category overview averageSalaryRange')
        .populate('organizationId', 'name slug domain')
        .populate('departmentId', 'name code');
    }

    return profile;
  }

  /**
   * Updates student profile attributes with strict tenant department verification.
   */
  static async updateProfile(userId, updateData) {
    const profile = await this.getOrCreateProfile(userId);

    // If departmentId is provided, verify it belongs to user's organization
    if (updateData.departmentId) {
      if (profile.organizationId) {
        const dept = await Department.findOne({
          _id: updateData.departmentId,
          organizationId: profile.organizationId,
        });
        if (!dept) {
          throw badRequest('Department does not exist within your college/organization');
        }
      }
    }

    const allowedFields = [
      'rollNumber',
      'graduationYear',
      'cgpa',
      'departmentId',
      'interests',
      'preferredRoles',
      'preferredLocations',
      'experienceLevel',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        profile[field] = updateData[field];
      }
    });

    await profile.save();

    return this.getOrCreateProfile(userId);
  }

  /**
   * Adds a skill or updates proficiency level for a student.
   */
  static async addOrUpdateSkill(userId, { skillId, proficiencyLevel = 1 }) {
    const skill = await Skill.findById(skillId);
    if (!skill) {
      throw notFound('Skill not found in system catalog');
    }

    const profile = await this.getOrCreateProfile(userId);

    const existingSkillIndex = profile.skills.findIndex(
      (s) => s.skillId.toString() === skillId.toString()
    );

    if (existingSkillIndex > -1) {
      profile.skills[existingSkillIndex].proficiencyLevel = proficiencyLevel;
      profile.skills[existingSkillIndex].skillName = skill.name;
    } else {
      profile.skills.push({
        skillId: skill._id,
        skillName: skill.name,
        proficiencyLevel,
        verified: false,
      });
    }

    await profile.save();
    return this.getOrCreateProfile(userId);
  }

  /**
   * Sets target career path for student.
   */
  static async setTargetCareer(userId, careerId) {
    const career = await Career.findById(careerId);
    if (!career || !career.isActive) {
      throw notFound('Career path not found or is currently inactive');
    }

    const profile = await this.getOrCreateProfile(userId);
    profile.targetCareerId = career._id;
    await profile.save();

    return this.getOrCreateProfile(userId);
  }
}
