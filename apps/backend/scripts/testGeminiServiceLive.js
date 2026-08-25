import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { GeminiService } from '../src/integrations/gemini/gemini.service.js';

async function testFullGeminiService() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  console.log('Testing live Gemini AI Roadmap generation with model gemini-3.5-flash-lite...');
  const roadmap = await GeminiService.generateCareerRoadmap({
    careerTitle: 'Full Stack Developer',
    durationWeeks: 6,
    matchedSkills: [{ name: 'JavaScript', level: 4 }],
    weakSkills: [{ name: 'React', level: 2, requiredLevel: 3, gap: 1 }],
    missingSkills: [{ name: 'Docker', requiredLevel: 2 }],
  });

  console.log('\n🎉 LIVE GEMINI ROADMAP GENERATED SUCCESSFULLY!');
  console.log('Roadmap Title:', roadmap.title);
  console.log('Milestones Count:', roadmap.milestones?.length);
  console.log('First Milestone:\n', JSON.stringify(roadmap.milestones?.[0], null, 2));

  await mongoose.disconnect();
  await mongod.stop();
}

testFullGeminiService();