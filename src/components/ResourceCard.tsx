import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";

interface ResourceCardProps {
    title: string;
    summary: string | null;
    type: string;
    category: string | null;
    fileUrl: string | null;
}

const ResourceCard = ({ title: title, summary: summary, type: type, category: category, fileUrl: fileUrl }: ResourceCardProps) => {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant="outline" className="bg-navy-50 text-navy-primary border-navy-200">
                        {type}
                    </Badge>
                    {category && (
                        <Badge variant="secondary" className="bg-gold-100 text-gold-800 hover:bg-gold-200">
                            {category}
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-xl text-navy-primary line-clamp-2" title={title}>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-gray-600 text-sm line-clamp-4">
                    {summary || "No summary available."}
                </p>
            </CardContent>
            <CardFooter>
                {fileUrl ? (
                    <Button
                        className="w-full bg-navy-primary hover:bg-navy-700 text-white group"
                        onClick={() => window.open(fileUrl, '_blank')}
                    >
                        <span className="mr-2">View Resource</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                ) : (
                    <Button disabled className="w-full bg-gray-200 text-gray-400 cursor-not-allowed">
                        Not Available
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default ResourceCard;
