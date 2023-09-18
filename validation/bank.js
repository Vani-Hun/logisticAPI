import Error from "../helper/error.js"
export const validateBankAccountUpdate = (data) => {
    const error = new Error();

    error
        .isRequired(data.bankName, "bank name")
        .isRequired(data.accountNumber, "account number")
        .isValidLength(data.accountNumber, "account number", 9, 14)
        .isRequired(data.branch, "branch")
        .isRequired(data.bank_account_owner_name, "bank account owner name")
        .isRequired(data.identity_card_number, "identity card number")
        .isValidLength(data.identity_card_number, "identity card number", 9, 12);

    if (error.get()) return error.errors;

    return null;
};

export const bankVerifyOTP = data => {
    const error = new Error()

    error.isRequired(data.otp, 'otp')

    return error.get()
}