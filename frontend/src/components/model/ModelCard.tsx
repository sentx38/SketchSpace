export default function ModelCard({category}: {category: CategoriesType}) {
    console.log(category.title)
    return (
        <div>
            {category.title}
        </div>
    )
}