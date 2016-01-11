module VORLON {
    export interface FeatureSupported {
        featureName: string;
        isSupported: boolean;
        supportLevel?: string;
        type: string;
    }
}