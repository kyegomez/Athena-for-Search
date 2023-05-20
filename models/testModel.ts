import { Schema, model, models} from 'mongoose'


const testSchema = new Schema({
    Query: { type: String, required: true },
    AthenaResponse: { type: String, required: true },
    Sources: { type: [String], required: true },
    requestTime: { type: Date, default: Date.now },
});


const Test = models.Test || model('athena-for-search', testSchema);


export default Test;
