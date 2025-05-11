
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { predictCottonDisease, CottonDisease, PredictionResponse } from '@/services/cotton-disease-api';
import { summarizeDiseaseInfo } from '@/ai/flows/summarize-disease-info';
import { generatePlantingTips } from '@/ai/flows/generate-planting-tips';
import { suggestTreatmentOptions } from '@/ai/flows/suggest-treatment-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, Leaf, AlertCircle, Activity, CheckCircle, XCircle, FlaskConical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock available products - Replace with actual data source
const MOCK_PRODUCTS = [
  { id: 'prod1', name: 'Neem Oil Spray', description: 'Organic broad-spectrum insecticide and fungicide.', suitableFor: ['Aphids', 'Powdery mildew'] },
  { id: 'prod2', name: 'Bacillus Thuringiensis (Bt)', description: 'Biological insecticide effective against caterpillars.', suitableFor: ['Army worm'] },
  { id: 'prod3', name: 'Copper Fungicide', description: 'Effective against bacterial and fungal diseases.', suitableFor: ['Bacterial blight', 'Target spot', 'Cotton Boll Rot'] },
  { id: 'prod4', name: 'Systemic Fungicide X', description: 'Provides systemic protection against various fungal issues.', suitableFor: ['Powdery mildew', 'Target spot'] },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

// Updated schema to expect a File object directly
const FormSchema = z.object({
  image: z.instanceof(File, { message: "Image is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .webp, and .gif formats are supported."
    ),
});

type DetectionResult = {
  disease: CottonDisease | null;
  imageUrl: string | null;
  summary: string | null;
  treatment: string | null;
  prevention: string | null;
  plantingTips: string | null;
};

export default function DetectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange", 
  });

  const { register, setValue, watch } = form;

  // Watch the image field to react to its changes, e.g., for debugging
  // const watchedImage = watch("image");
  // useEffect(() => {
  //   console.log("Watched image in RHF:", watchedImage);
  //   console.log("Form errors:", form.formState.errors);
  //   console.log("Is form valid:", form.formState.isValid);
  // }, [watchedImage, form.formState.errors, form.formState.isValid]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0]; // Get the single File object
      setValue('image', file, { shouldValidate: true }); // Update form state with the File object
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setValue('image', undefined as any, { shouldValidate: true }); // Reset form state if no file, use undefined to trigger "required"
    }
    setResult(null); // Clear previous results on new file selection
    setError(null);
  };

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const imageFile = data.image; // data.image is now a File object

    if (!imageFile) {
        setError("No image file provided after validation."); // Should not happen if form is valid
        setIsLoading(false);
        return;
    }

    try {
      console.log("Calling predictCottonDisease...");
      const prediction: PredictionResponse = await predictCottonDisease(imageFile);
      console.log("Prediction received:", prediction);

      const currentResult: DetectionResult = {
        disease: prediction.disease,
        imageUrl: preview, // Use the generated preview URL
        summary: null,
        treatment: null,
        prevention: null,
        plantingTips: null,
      };

      setResult(currentResult); 

      if (prediction.disease && prediction.disease !== 'Healthy') {
        console.log(`Generating summary for: ${prediction.disease}`);
        const summaryRes = await summarizeDiseaseInfo({ disease: prediction.disease });
        currentResult.summary = summaryRes.summary;
        setResult({ ...currentResult });

        console.log(`Generating treatment options for: ${prediction.disease}`);
        const relevantProducts = MOCK_PRODUCTS.filter(p => p.suitableFor.includes(prediction.disease!));
        const treatmentRes = await suggestTreatmentOptions({
            disease: prediction.disease,
            availableProducts: relevantProducts.map(p => ({ name: p.name, description: p.description })),
         });
        currentResult.treatment = treatmentRes.treatmentOptions;
        currentResult.prevention = treatmentRes.preventativeMeasures;
        setResult({ ...currentResult });

      } else if (prediction.disease === 'Healthy') {
         console.log("Generating planting tips for Healthy plant...");
         const tipsRes = await generatePlantingTips({ disease: 'Healthy' });
         currentResult.plantingTips = tipsRes.plantingTips;
         setResult({ ...currentResult });
      } else {
        console.log("Disease prediction was null or unrecognized, but not 'Healthy'.");
        currentResult.summary = "Could not definitively identify a disease. The plant might be healthy or affected by an unknown issue.";
        setResult({...currentResult});
      }

    } catch (err: any) {
      console.error('Error during detection or AI generation:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDiseaseBadgeVariant = (disease: CottonDisease | null): "default" | "destructive" | "secondary" => {
     if (disease === 'Healthy') return 'default';
     if (disease) return 'destructive';
     return 'secondary';
  };

  const getDiseaseIcon = (disease: CottonDisease | null) => {
     if (disease === 'Healthy') return <CheckCircle className="h-5 w-5 text-green-600" />;
     if (disease) return <AlertCircle className="h-5 w-5 text-destructive" />;
     return <XCircle className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
             <Leaf className="h-6 w-6 text-primary" />
             Cotton Disease Detection
          </CardTitle>
          <CardDescription>
            Upload an image of your cotton plant leaf to detect potential diseases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="dropzone-file"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted transition-colors",
                            fieldState.error ? "border-destructive" : "border-input"
                          )}
                        >
                          {preview ? (
                             <div className="relative w-full h-full">
                                <Image
                                   src={preview}
                                   alt="Selected plant preview"
                                   layout="fill"
                                   objectFit="contain"
                                   className="rounded-lg"
                                />
                             </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          )}
                          <Input
                            id="dropzone-file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            // {...register("image")} // register can be used, but onChange handles setValue
                            onChange={handleFileChange} // Use manual handler
                            disabled={isLoading}
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
                {isLoading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Detect Disease'
                )}
              </Button>
            </form>
          </Form>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && !result && (
             <div className="mt-6 space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
             </div>
          )}

          {result && (
            <Card className="mt-8 border-accent shadow-md">
               <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                     <span>Analysis Results</span>
                      <Badge variant={getDiseaseBadgeVariant(result.disease)} className="text-sm px-3 py-1">
                         {getDiseaseIcon(result.disease)}
                         <span className="ml-1.5">{result.disease ?? 'Unknown'}</span>
                      </Badge>
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {result.imageUrl && (
                     <div className="my-4 max-h-64 overflow-hidden rounded-md border flex justify-center items-center bg-muted">
                        <Image src={result.imageUrl} alt="Analyzed plant" width={200} height={200} objectFit="contain" />
                    </div>
                 )}

                  {isLoading && !result.summary && !result.treatment && !result.plantingTips ? (
                      <div className="space-y-2">
                         <Skeleton className="h-4 w-3/4"/>
                         <Skeleton className="h-4 w-1/2"/>
                      </div>
                  ) : result.summary ? (
                    <div>
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-1.5"><Leaf className="h-5 w-5 text-primary"/>Disease Summary</h3>
                      <ScrollArea className="h-32 w-full rounded-md border p-3 bg-secondary/30">
                        <p className="text-sm text-foreground">{result.summary}</p>
                      </ScrollArea>
                    </div>
                  ) : null}


                  {isLoading && !result.treatment && !result.prevention && result.disease !== 'Healthy' ? (
                      <div className="space-y-2">
                         <Skeleton className="h-4 w-3/4"/>
                         <Skeleton className="h-4 w-1/2"/>
                      </div>
                  ) : result.treatment || result.prevention ? (
                    <div>
                       <h3 className="font-semibold text-lg mb-1 flex items-center gap-1.5"><FlaskConical className="h-5 w-5 text-accent"/>Treatment & Prevention</h3>
                       <ScrollArea className="h-40 w-full rounded-md border p-3 bg-secondary/30 space-y-3">
                           {result.treatment && <p className="text-sm text-foreground"><strong className="text-primary">Treatment:</strong> {result.treatment}</p>}
                           {result.prevention && <p className="text-sm text-foreground"><strong className="text-primary">Prevention:</strong> {result.prevention}</p>}
                       </ScrollArea>
                    </div>
                  ) : null}

                  {isLoading && !result.plantingTips && result.disease === 'Healthy' ? (
                     <div className="space-y-2">
                         <Skeleton className="h-4 w-3/4"/>
                         <Skeleton className="h-4 w-1/2"/>
                     </div>
                  ) : result.plantingTips ? (
                    <div>
                       <h3 className="font-semibold text-lg mb-1 flex items-center gap-1.5"><CheckCircle className="h-5 w-5 text-green-600"/>Planting Tips</h3>
                       <ScrollArea className="h-32 w-full rounded-md border p-3 bg-secondary/30">
                         <p className="text-sm text-foreground">{result.plantingTips}</p>
                       </ScrollArea>
                    </div>
                  ) : null}

               </CardContent>
               <CardFooter>
                    <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent">
                        <Link href={result.disease && result.disease !== 'Healthy' ? `/products?disease=${encodeURIComponent(result.disease)}` : "/products"}>
                            {result.disease && result.disease !== 'Healthy' ? `View Recommended Products for ${result.disease}` : "Browse All Products"}
                        </Link>
                    </Button>
               </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


    