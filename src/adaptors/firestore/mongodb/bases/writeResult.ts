import { WriteResult as WriteResultInterface } from "@google-cloud/firestore";

export class WriteResult implements WriteResultInterface {
  writeTime: FirebaseFirestore.Timestamp;

  constructor(writeTime: FirebaseFirestore.Timestamp) {
    this.writeTime = writeTime;
  }

  isEqual(other: WriteResultInterface): boolean {
    return this.writeTime.isEqual(other.writeTime);
  }
}

