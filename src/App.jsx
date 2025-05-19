import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/chef_header.jsx";
import IngredientForm from "./components/IngredientsActivity/ingredient_form.jsx";
import SavedRecipes from "./components/RecipeActivity/saved_recipes.jsx";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<IngredientForm />} />
        <Route path="/saved-recipes" element={<SavedRecipes />} />
      </Routes>
    </Router>
  );
}

export default App;