import enum


class TextDirection(str, enum.Enum):
    LTR = "ltr"
    RTL = "rtl"


class TranslationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
