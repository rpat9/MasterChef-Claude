import express from 'express';
import { getRecipeFromClaude } from '../services/claudeService.js';

const router = express.Router();

// Generate a recipe from ingredients
router.post('/generate' , async (req, res) => {
    try {
        const { ingredients } = req.body;

        if(!ingredients || Array.isArray(ingredients) || ingredients.length === 0){
            return res.status(400).json({ error: 'Valid list of ingredients is required' });
        }

        const recipe = await getRecipeFromClaude(ingredients);

        res.status(200).json({ recipe });
    } catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).json({ error: 'Failed to generate recipe' });
    }
});

export default router;