import 'dotenv/config'
import { corsair } from "./corsair"

const main = async () => {
    const res = await corsair.gmail.db.threads.search({
        data:{
            snippet: {
                contains: "jio"
            }
        }
    });
    console.log(res)
}

main()