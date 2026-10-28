/**
 * GINA-ANTIGRAVITY-YOINKS-GITHUB-2026-V1
 * Structural AST Watermark — Layer 6 (SEC-06: argon.sec-06.tsiu-lead@security.ginaservice.com)
 * Classification: TS-L1 Open-Source Integration (MIT License Compatible)
 * Sovereign Umbrella: GINASERVICE SARL AU (Casablanca RC N° 214563) & ReferPay DAO (Singapore CLL#16219882)
 */
declare const GINA_AST_WATERMARK: Readonly<{
    documentRef: "GINA-ANTIGRAVITY-YOINKS-GITHUB-2026-V1";
    securityProtocol: "GINA-SEC-7L-2026";
    classification: "SEC-L1/TS-L1";
    leakageScoreSLeak: 0;
    secretRetentionRSecret: 1;
    legalComplianceRLegal: 1;
    fintechIsolationPatent: "MA-PATENT-30828-ISOLATED";
    licenseProtocol: "GINA-IA-0001";
}>;
interface YoinksAuditRecord {
    taskUuid: string;
    agentId: string;
    clearance: "SEC-L1/TS-L1";
    sourceUrl: string;
    outputFileHash: string;
    threatScoreTheta: number;
    leakageScoreSLeak: number;
    timestamp: number;
    wormStreamTarget?: string;
    merkleRoot?: string;
    evolutionScoreSEvolve?: number;
}
interface SovereignLayerSupervisors {
    layer1Ciso: "argon.sec-01.ciso@security.ginaservice.com";
    layer2Ztna: "argon.sec-02.ztna@security.ginaservice.com";
    layer3Icam: "argon.sec-03.icam@security.ginaservice.com";
    layer4Arti: "argon.sec-04.arti@security.ginaservice.com";
    layer5Emsi: "pro.sec-05.emsi@security.ginaservice.com";
    layer6Tsiu: "argon.sec-06.tsiu-lead@security.ginaservice.com";
    layer7Worm: "pro.sec-07.worm-audit@security.ginaservice.com";
}
declare const SOVEREIGN_SUPERVISORS: SovereignLayerSupervisors;
declare class GinaYoinksSecurityGuard {
    /**
     * Layer 1 (SEC-01 CISO — argon.sec-01.ciso@security.ginaservice.com):
     * Verifies runtime fingerprint (FP_runtime) and HMAC-SHA256 signature before launching media tasks.
     */
    static verifyRuntimeFingerprint(agentId?: string, hmacKey?: string): {
        fpRuntime: string;
        hmacSignature: string;
        verified: boolean;
    };
    /**
     * Layer 2 (SEC-02 ZTNA — argon.sec-02.ztna@security.ginaservice.com):
     * Issues a 30-second ephemeral SIACP session token for outbound media egress.
     */
    static createSiacpEphemeralSession(agentId?: string): {
        sessionId: string;
        issuedAt: number;
        expiresAt: number;
        ttlSeconds: 30;
        supervisor: string;
    };
    /**
     * Layer 3 (SEC-03 ICAM — argon.sec-03.icam@security.ginaservice.com):
     * Enforces Bell-LaPadula ("No Read Up") and Biba ("No Write Down") isolation between
     * SEC-L1/TS-L1 media containers and TS-L3/TS-L4 Sovereign/Fintech layers (Patent No. 30828).
     */
    static enforceBellLaPadulaBiba(subjectClearance?: "SEC-L1/TS-L1", targetClassification?: "SEC-L1/TS-L1" | "TS-L3" | "TS-L4", operation?: "read" | "write"): boolean;
    /**
     * Layer 4 (SEC-04 ARTI — argon.sec-04.arti@security.ginaservice.com):
     * Pre-ingestion URL sanitizer & SSRF/Injection quarantine gate (Theta < 0.85)
     */
    static validateAndSanitizeUrl(rawUrl: string): {
        valid: boolean;
        theta: number;
        sanitizedUrl: string;
    };
    /**
     * Layer 4 & Layer 5 (SEC-04 ARTI & SEC-05 EMSI):
     * Verifies the SHA-256 binary fingerprint of yt-dlp / ffmpeg-static before execution.
     * For system PATH command names (e.g. 'yt-dlp'), returns verified status with command hash descriptor.
     */
    static verifyBinaryIntegrity(binaryPath: string, expectedSha256?: string): {
        valid: boolean;
        sha256: string;
        binaryPath: string;
    };
    /**
     * Layer 5 (SEC-05 EMSI — pro.sec-05.emsi@security.ginaservice.com):
     * Generates a Redis AST Semantic Merge Lock and DocumentMutexLock token.
     */
    static acquireAstSemanticLock(resourceKey?: string, branch?: string): {
        lockKey: string;
        branch: string;
        mutexToken: string;
        supervisor: string;
        acquiredAt: number;
    };
    /**
     * Layer 6 (SEC-06 TSIU — argon.sec-06.tsiu-lead@security.ginaservice.com):
     * Scrubs child-process environment variables to guarantee S_leak = 0.00 and R_secret = 1.0.
     */
    static createSanitizedChildEnv(baseEnv?: NodeJS.ProcessEnv): {
        sanitizedEnv: NodeJS.ProcessEnv;
        sLeak: 0.0;
        rSecret: 1.0;
        rLegal: 1.0;
    };
    /**
     * Layer 7 (SEC-07 WORM-AUDIT — pro.sec-07.worm-audit@security.ginaservice.com):
     * Generates SHA-256 WORM audit record for downloaded media
     */
    static generateWormAuditRecord(filePath: string, sourceUrl: string, agentId?: string): YoinksAuditRecord;
    /**
     * File 07 (07-idea-engineering-evolution.md):
     * Computes self-evolution score S_evolve verifying thresholds:
     * Novelty >= 0.70, Confidence >= 0.85, Alignment >= 0.95, Drift < 0.02
     */
    static computeSelfEvolutionScore(metrics: {
        novelty: number;
        confidence: number;
        alignment: number;
        drift: number;
    }): {
        valid: boolean;
        sEvolve: number;
    };
}

export { GINA_AST_WATERMARK, GinaYoinksSecurityGuard, SOVEREIGN_SUPERVISORS, type SovereignLayerSupervisors, type YoinksAuditRecord };
