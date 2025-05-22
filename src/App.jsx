import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Contexts/AuthContext.jsx";
import { ThemeProvider } from "./Contexts/ThemeContext.jsx";
import Header from "./components/NavbarActivity/chef_header.jsx";
import IngredientForm from "./components/IngredientsActivity/ingredient_form.jsx";
import SavedRecipes from "./components/RecipeActivity/saved_recipes.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<IngredientForm />} />
            <Route path="/saved-recipes" element={<SavedRecipes />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;