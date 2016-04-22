#include <stdio.h>
#include <math.h>
#include <stdlib.h>

// Slimfly basic configuration parameters
#define GLOBAL_CHANNELS 5			//(h): Number of global channels per router
#define LOCAL_CHANNELS 2        	//   : Number of local channels per router
#define NUM_ROUTER 5				//(a): Number of routers in each group
#define NUM_TERMINALS 3			//(p): Number of terminal connections per router

int main(int argc, char **argv)
{
	FILE * output_file=NULL;
    FILE * input_file=NULL;
    FILE * gvt_file=NULL;

	char log[100];
	sprintf( log, "slimfly-raw/slimfly-ross-stats-0.txt");
	gvt_file = fopen ( log, "r");
	if (gvt_file==NULL)
	{
		printf("Failed to Open Slim_fly gvt file %s \n",log);
	}

	char mystring[100000];
	char ch;
	int gvt_count;					//Total number of GVT calculations in simulation
	printf("finding total number of gvt calculations\n");
	while( fgets(mystring , 100000 , gvt_file) != NULL )
	{
		gvt_count++;
	}
	gvt_count = gvt_count-4;		//Get rid of header and the typical last 3 nan lines
	printf("found %d gvt calculations\n",gvt_count);

	float *gvt;
	gvt = (float*)malloc(gvt_count*sizeof(float));

	rewind(gvt_file);

	char * line = NULL;
	char * pch;
	size_t len = 0;
	ssize_t read;
	int i,j,f;
	printf("extracting gvt times\n");
		read = getline(&line, &len, gvt_file);
	for(i=0; i<gvt_count; i++)
	{
		read = getline(&line, &len, gvt_file);
		pch = strtok (line,",");
		gvt[i] = atof(pch);
//		printf("gvt[%d]:%f\n",i,gvt[i]);
	}
    printf("gvt[%d]:%f\n",i,gvt[i]);
	fclose(gvt_file);

    int num_events;
	int num_stride_old = 7;				//Number of lps in old mapping before repeating pattern
	int num_stride_new = 4;				//Number of lps in new mapping before repeating pattern
    int num_pes = 16;
    int num_lps = 200;
    int num_metrics = 10;
    int data[num_lps][gvt_count][num_metrics];
    printf("here\n");
//Loop over all data files
for(f=0; f<num_pes; f++)
{
    num_events = 0;
    printf("opening raw event file %d\n",f);
    sprintf( log, "slimfly-raw/event-log-%d.txt",f);
    input_file = fopen ( log, "r");
    if (input_file==NULL)
    {
        printf("Failed to Open Slim_fly input file %s \n",log);
    }
    
    printf("finding total number of events for pe\n");
    while( fgets(mystring , 100000 , input_file) != NULL )
    {
        num_events++;
    }
    num_events--;
    printf("num_events:%d\n",num_events);
    rewind(input_file);

	int x,y,z;
    float temp;
	int tempx;

    printf("parsing raw event data\n");
	for(i=0;i<num_events;i++)
	{
		read = getline(&line, &len, input_file);
		pch = strtok (line,",");
		tempx = atoi(pch);				//src LP ID
		if(x<num_stride_old)
		{
			x = (int)ceil(tempx/num_stride_old)*num_stride_new + tempx%num_stride_old - num_stride_new+1;
		}
		else
		{
			x = (int)floor(tempx/num_stride_old)*num_stride_new + tempx%num_stride_old - num_stride_new+1;
		}
		pch = strtok (NULL,",");
		pch = strtok (NULL,",");
		z = atoi(pch);				//event type
		pch = strtok (NULL,",");
		temp = atof(pch);
//        printf("x:%d z:%d temp:%f\n",x,z,temp);
		j=0;
		while(temp>gvt[j] && j<gvt_count)
		{
            j++;
		}
        y = j;
        
        data[x][y][z]++;            //increment associated metric
//        printf("file:%d i:%d j:%d oldx:%d x:%d y:%d z:%d data:%d\n",f,i,j,tempx,x,y,z,data[x][y][z]);
    }
    fclose(input_file);
}

//Loop over all output metric data files
//for(f=0; f<num_metrics; f++)
//{
	printf("Opening output file\n");
	sprintf( log, "slimfly-processed/forward-send-event-log.txt");
	output_file = fopen ( log, "w");
	if (output_file==NULL)
	{
		printf("Failed to Open Slim_fly output file %s \n",log);
	}

	printf("Printfing output data\n");
	fprintf(output_file,"GVT-Bin, ");
	for(i=0;i<num_lps-1;i++)
	{
		fprintf(output_file,"LP%d, ",i); 
	}
	fprintf(output_file,"LP%d\n",num_lps-1);
	for(i=0;i<gvt_count;i++)
	{
//		printf("gvt:%d\n",i);
		fprintf(output_file,"%6.6f, ",gvt[i]);
		for(j=0;j<num_lps-1;j++)
		{
			fprintf(output_file,"%2d, ",data[j][i][0]);
		}
		fprintf(output_file,"%2d\n",data[num_lps-1][i][0]);
	}

	fclose(output_file);

   	return 0;
}
