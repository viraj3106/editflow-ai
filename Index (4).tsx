import { useState } from "react";
import { Header } from "@/components/editflow/Header";
import { TextInput } from "@/components/editflow/TextInput";
import { ConversionControls } from "@/components/editflow/ConversionControls";
import { OutputCard } from "@/components/editflow/OutputCard";
import { refineText } from "@/lib/refine-text";
import { useConversionHistory, ConversionRecord } from "@/hooks/use-conversion-history";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { toast } from "sonner";

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [sourceType, setSourceType] = useState("notes");
  const [targetType, setTargetType] = useState("professional-email");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { history, addToHistory, clearHistory } = useConversionHistory();
  
  // Auto-save draft
  useAutoSave(inputText, sourceType, targetType, setInputText, setSourceType, setTargetType);

  const handleConvert = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setOutput("");

    const result = await refineText({
      text: inputText,
      sourceType,
      targetType,
    });

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    setOutput(result.refinedText);
    
    // Add to history
    addToHistory({
      input: inputText,
      output: result.refinedText,
      sourceType,
      targetType,
    });
    
    setIsLoading(false);
  };

  const handleHistorySelect = (record: ConversionRecord) => {
    setInputText(record.input);
    setSourceType(record.sourceType);
    setTargetType(record.targetType);
    setOutput(record.output);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onConvert: handleConvert,
    canConvert: !!inputText.trim(),
    isLoading,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 pb-12">
        <Header
          history={history}
          onHistorySelect={handleHistorySelect}
          onHistoryClear={clearHistory}
        />

        {/* Desktop: 3-column layout | Mobile: stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-6 lg:gap-8 items-start">
          {/* Left: Input */}
          <div className="order-1">
            <TextInput
              value={inputText}
              onChange={setInputText}
              disabled={isLoading}
            />
          </div>

          {/* Center: Controls */}
          <div className="order-2 lg:order-2 lg:w-48 lg:pt-6">
            <ConversionControls
              sourceType={sourceType}
              targetType={targetType}
              onSourceChange={setSourceType}
              onTargetChange={setTargetType}
              onConvert={handleConvert}
              isLoading={isLoading}
              disabled={!inputText.trim()}
            />
            <p className="text-xs text-muted-foreground text-center mt-3 hidden lg:block">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to refine
            </p>
          </div>

          {/* Right: Output */}
          <div className="order-3">
            <OutputCard output={output} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;