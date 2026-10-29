export const QUEUES =  {
    SYSTEM: 'system',
    AI: 'ai',
}

export const JOB_NAMES = {
    HEALTH_CHECK: 'health-check',

    EMBADDING_GENERATION: 'embedding-generation',
    IMAGE_ANALYSIS: 'image-analysis',
    IMAGE_METADATA: 'image-metadata',
    MEMORY_INDEXING: 'memory-indexing',
    WEEKLY_REFLECTION: 'weekly-reflection',
} as const;