import { Firestore } from "@google-cloud/firestore"
import { Logging } from "@google-cloud/logging"

const firestore = new Firestore()

const info = () => {
    console.log(firestore)
}

export default info