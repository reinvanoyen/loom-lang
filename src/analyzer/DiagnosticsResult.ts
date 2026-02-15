
type DiagnosticMessage = {
    message: string;
    nodeId: number;           // or span/line/col later
};

export default class DiagnosticsResult {
    private messages: DiagnosticMessage[] = [];
}