import { Router } from 'express';
import { 
  generateText, 
  generateDevelopmentPlanController, 
  getDomainsController,
  getCompetenciesController,
  getAspectsController 
} from '../controllers/aiController.js';

const router = Router();

router.post('/generate', generateText);

router.post('/development-plan', generateDevelopmentPlanController);

router.get('/domains', getDomainsController);

router.get('/competencies', getCompetenciesController);

router.get('/aspects', getAspectsController);

export default router;


