import { mkdir } from "fs"
import { sendError, sendServerError } from "../helper/client.js"
import individualContract from "../model/IndividualContract.js"
import businessContract from "../model/BusinessContract.js"
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { createDirectory } from './storage.js'

export const createUploadDir = (req, res, next) => {
    const d = new Date()
    const dirName = d.toISOString().slice(0, 7)
    mkdir(`public/uploads/${dirName}`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = dirName
    next()
}

export const createAssetsDir = (req, res, next) => {
    mkdir(`public/assets`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'assets'
    next()
}

export const createAboutUsDir = (req, res, next) => {
    mkdir(`public/aboutUs`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'aboutUs'
    next()
}

export const createPartnerUsDir = (req, res, next) => {
    mkdir(`public/partner`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'partner'
    next()
}

export const createQuoteDir = (req, res, next) => {
    mkdir(`public/quote`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'quote'
    next()
}

export const createBlogDir = (req, res, next) => {
    mkdir(`public/blog`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'blog'
    next()
}

export const createCommitmentDir = (req, res, next) => {
    mkdir(`public/commitment`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'commitment'
    next()
}

export const createDeliveryServiceDir = (req, res, next) => {
    mkdir(`public/deliveryService`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'deliveryService'
    next()
}

export const createParticipantDir = (req, res, next) => {
    mkdir(`public/participant`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'participant'
    next()
}

export const createFeatureDir = (req, res, next) => {
    mkdir(`public/feature`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'feature'
    next()
}

export const createProhibitedProductDir = (req, res, next) => {
    mkdir(`public/prohibitedProduct`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'prohibitedProduct'
    next()
}

export const createOrderDir = (req, res, next) => {
    mkdir(`public/order`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'order'
    next()
}

export const createOrderIssueDir = (req, res, next) => {
    mkdir(`public/orderIssue`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'orderIssue'
    next()
}
export const createcontainerImagesLife = (req, res, next) => {
    mkdir(`public/ImagesLife`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'orderIssue'
    next()
}
export const createStrengthDir = (req, res, next) => {
    mkdir(`public/strength`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'strength'
    next()
}

export const createCareerLifeDir = (req, res, next) => {
    mkdir(`public/careerLife`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'careerLife'
    next()
}

export const createChatInfoDir = (req, res, next) => {
    mkdir(`public/chatInfo`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'chatInfo'
    next()
}
const uploadPath = 'public';
export const createSignatureDir = async (req, res, next) => {
    try {
        const directoryPath = path.join(uploadPath, 'signature');
        await createDirectory(directoryPath);
        req.dirName = 'signature';
        next();
    } catch (err) {
        sendError(res, err);
    }
};
export const createImageAboutUs = async (req, res, next) => {
    try {
        const directoryPath = path.join(uploadPath, 'imageAboutUs');
        await createDirectory(directoryPath);
        req.dirName = 'imageAboutUs';
        next();
    } catch (err) {
        sendError(res, err);
    }
};
export const createContainerImage = async (req, res, next) => {
    try {
        const directoryPath = path.join(uploadPath, 'containerImage');
        await createDirectory(directoryPath);
        req.dirName = 'containerImage';
        next();
    } catch (err) {
        sendError(res, err);
    }
};
export const createAppSignatureDir = async (req, res, next) => {
    try {
        const directoryPath = path.join(uploadPath, 'appSignature');
        await createDirectory(directoryPath);
        req.dirName = 'appSignature';
        next();
    } catch (err) {
        sendError(res, err);
    }
};
export const createBankAccountsDir = (req, res, next) => {
    mkdir(`public/bankAccount`, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
            return sendError(res, 'Cannot upload file.');
        }
        console.log('Folder created successfully.');
    })
    req.dirName = 'bankAccount'
    next()
}

export const createPrivateDir = async (req, res, next) => {
    let { id } = await req.params
    if (id) {
        const isExist = await individualContract.findOne({ customer: id })
        if (isExist) {
            fs.unlink(isExist.ID_front_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.ID_back_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.portrait_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        }
    } else {
        const isExist = await individualContract.findOne({ customer: req.user.role._id })
        if (isExist) {
            fs.unlink(isExist.ID_front_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.ID_back_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.portrait_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        }
    }

    await mkdir(`public/private`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = await 'private'
    await next()
}

export const createBusinessDir = async (req, res, next) => {
    let { id } = await req.params
    if (id) {
        const isExist = await businessContract.findOne({ customer: id })
        if (isExist) {
            fs.unlink(isExist.ID_front_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.ID_back_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.portrait_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        }
    } else {
        const isExist = await businessContract.findOne({ customer: req.user.role._id })
        if (isExist) {
            fs.unlink(isExist.ID_front_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.ID_back_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.portrait_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        }
    }

    await mkdir(`public/business`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = await 'business'
    await next()
}

export const createImageDir = (req, res, next) => {
    mkdir(`public/images`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'images'
    next()
}

export const createContactDir = (req, res, next) => {
    mkdir(`public/contact`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'contact'
    next()
}

export const createSocialNetworkDir = (req, res, next) => {
    mkdir(`public/social`, { recursive: true }, (err) => {
        if (err) return sendError(res, 'Cannot upload file.')
    })
    req.dirName = 'social'
    next()
}
