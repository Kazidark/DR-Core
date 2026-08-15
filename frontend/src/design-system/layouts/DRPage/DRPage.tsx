import styles from "./DRPage.module.css";

import {
    DRText,
} from "@/design-system";

import type {
    DRPageProps,
} from "./DRPage.types";

export default function DRPage({
    title,
    description,
    actions,
    children,
    hideHeader = true,
}: DRPageProps) {
    return (
        <div
            className={
                styles.page
            }
        >
            {!hideHeader && (
                <div
                    className={
                        styles.header
                    }
                >
                    <div
                        className={
                            styles.titleGroup
                        }
                    >
                        <DRText
                            as="h1"
                            variant="h1"
                            weight="bold"
                        >
                            {title}
                        </DRText>

                        {description && (
                            <DRText
                                variant="body"
                                color="secondary"
                            >
                                {description}
                            </DRText>
                        )}
                    </div>

                    {actions && (
                        <div
                            className={
                                styles.actions
                            }
                        >
                            {actions}
                        </div>
                    )}
                </div>
            )}

            <div
                className={
                    styles.content
                }
            >
                {children}
            </div>
        </div>
    );
}