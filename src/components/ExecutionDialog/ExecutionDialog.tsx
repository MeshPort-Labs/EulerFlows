import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Play, 
  CheckCircle, 
  Eye,
  Zap
} from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';

interface ExecutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
}

export const ExecutionDialog: React.FC<ExecutionDialogProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
}) => {
  const handleExecute = () => {
    console.log('Executing workflow...');
  };

  const handleSimulate = () => {
    console.log('Simulating workflow...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Workflow Execution
          </DialogTitle>
          <DialogDescription>
            Review, simulate, and execute your EulerSwap workflow
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Workflow Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700">
                    ✅ Workflow is valid and ready for execution
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Workflow Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Nodes:</span>
                      <span className="ml-2 font-medium">{nodes.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Connections:</span>
                      <span className="ml-2 font-medium">{edges.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Transaction Simulation</h3>
                <Button 
                  onClick={handleSimulate}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Simulate
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="execution" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Execute Workflow</h3>
                <Button 
                  onClick={handleExecute}
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Execute
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};