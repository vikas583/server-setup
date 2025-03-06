import { Service } from "typedi";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import logger from "../../utils/logger";
import { dbConnection } from "../../utils/dbConnection";
import { FeedbackForm } from "../../entity/feedbackForm";
import { AdminFeedbackFormQuestionRequest, AdminFeedbackFormRequest } from "../../admin-types";
import { FeedbackFormQuestions } from "../../entity/feedbackFormQuestions";
import { FeedbackFormQuestionType } from "../../types";

@Service()
export class AdminFeedbackService {
    async createForm(body: AdminFeedbackFormRequest) {
        try {

            const dataSource = await dbConnection()

            const feedbackFormObj = new FeedbackForm()
            feedbackFormObj.formType = body.formType

            return await dataSource.getRepository(FeedbackForm).save(feedbackFormObj)

        } catch (err) {

            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            logger.error(errorMessage)
            throw new APIError(errorMessage, errorCode);
        }
    }

    async addQuestionsToForm(body: AdminFeedbackFormQuestionRequest) {
        try {
            const dataSource = await dbConnection()

            const feedbackFormQuestion = new FeedbackFormQuestions()
            feedbackFormQuestion.question = body.question
            feedbackFormQuestion.feedbackId = body.feedbackId
            if (body.questionType === FeedbackFormQuestionType.RATING) {
                feedbackFormQuestion.minRating = body.minRating
                feedbackFormQuestion.maxRating = body.maxRating
                feedbackFormQuestion.questionType = body.questionType
            } else {
                feedbackFormQuestion.questionType = body.questionType
            }

            return await dataSource.getRepository(FeedbackFormQuestions).save(feedbackFormQuestion)


        } catch (err) {
            console.log(err)
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            logger.error(errorMessage)
            throw new APIError(errorMessage, errorCode);
        }
    }

    async listUserFeedback() {
        try {

        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            logger.error(errorMessage)
            throw new APIError(errorMessage, errorCode);
        }
    }
}