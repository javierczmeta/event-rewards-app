import { useCategories } from "../contexts/CategoryContext";

const CategorySelector = ({selectorOptions}) => {
    const categories = useCategories();

    return (
        <select required {...selectorOptions}>
            <option value={categories.default}>
                --Category: Please choose an option--
            </option>

            {categories.options.map(category => <option value={category}>{category}</option>)}
            
        </select>
    );
};

export default CategorySelector;
