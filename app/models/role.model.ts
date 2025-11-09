import { Schema,model } from "mongoose";
import { IRole } from "../interface/role.interface";
const roleSchema  = new Schema<IRole>({
    name:{
    type: String,
    enum: ["Admin", "Teacher", "Student"],
    required: true,
    unique: true,
  },
})
export const RoleModel = model<IRole>("Role", roleSchema);