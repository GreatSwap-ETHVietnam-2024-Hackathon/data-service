import TokenRequestModel from "../models/token-request";

export async function getAllRequests() {
    return (await TokenRequestModel.find()).map(request => request.token)
}

export async function removeInvalidRequest(token: string) {
    await TokenRequestModel.deleteOne({ token })
}