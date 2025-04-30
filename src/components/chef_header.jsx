import masterChef_claude from "../assets/masterChef_claude.png"

export default function ChefHeader(){
    return (

        <header className="flex justify-center items-center gap-[11px] h-[85px] !bg-white cursor-default" style={{boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"}}>

            <img className="w-[55px] !bg-white" src={masterChef_claude} alt="MasterChef Claude" />
            
            <h1 className="!bg-white !font-normal">MasterChef Claude</h1>

        </header>
        
    )
}